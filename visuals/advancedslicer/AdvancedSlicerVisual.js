"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="../../base/references.d.ts"/>
var AdvancedSlicer_1 = require("./AdvancedSlicer");
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var SelectionId = powerbi.visuals.SelectionId;
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var data = powerbi.data;
var SelectionManager = powerbi.visuals.utility.SelectionManager;
var AdvancedSlicerVisual = (function (_super) {
    __extends(AdvancedSlicerVisual, _super);
    function AdvancedSlicerVisual() {
        _super.apply(this, arguments);
        /**
         * The font awesome resource
         */
        this.fontAwesome = {
            url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
            integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT' +
                '/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
            crossorigin: "anonymous"
        };
    }
    /**
     * Called when the visual is being initialized
     */
    AdvancedSlicerVisual.prototype.init = function (options) {
        var _this = this;
        _super.prototype.init.call(this, options, '<div></div>');
        this.host = options.host;
        this.mySlicer = new AdvancedSlicer_1.AdvancedSlicer(this.element);
        this.mySlicer.serverSideSearch = false;
        this.mySlicer.showSelections = true;
        this.selectionManager = new SelectionManager({ hostServices: this.host });
        this.mySlicer.events.on("loadMoreData", function (item) { return _this.onLoadMoreData(item); });
        this.mySlicer.events.on("canLoadMoreData", function (item, isSearch) { return item.result = isSearch || !!_this.dataView.metadata.segment; });
        this.mySlicer.events.on("selectionChanged", function (newItems, oldItems) { return _this.onSelectionChanged(newItems); });
    };
    /**
     * Called when the visual is being updated
     */
    AdvancedSlicerVisual.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        this.mySlicer.dimensions = options.viewport;
        this.dataView = options.dataViews && options.dataViews[0];
        if (this.dataView) {
            var categorical = this.dataView && this.dataView.categorical;
            var newData = AdvancedSlicerVisual.converter(this.dataView, this.selectionManager);
            if (this.loadDeferred) {
                var added_1 = [];
                var anyRemoved = false;
                Utils_1.default.listDiff(this.mySlicer.data.slice(0), newData, {
                    /**
                     * Returns true if item one equals item two
                     */
                    equals: function (one, two) { return one.match === two.match; },
                    /**
                     * Gets called when the given item was added
                     */
                    onAdd: function (item) { return added_1.push(item); }
                });
                // We only need to give it the new items
                this.loadDeferred.resolve(added_1);
                delete this.loadDeferred;
            }
            else if (Utils_1.default.hasDataChanged(newData.slice(0), this.mySlicer.data, function (a, b) { return a.match === b.match; })) {
                this.mySlicer.data = newData;
            }
            this.mySlicer.showValues = !!categorical && !!categorical.values && categorical.values.length > 0;
            var sortedColumns = this.dataView.metadata.columns.filter(function (c) { return !!c.sort; });
            if (sortedColumns.length) {
                var lastColumn = sortedColumns[sortedColumns.length - 1];
                this.mySlicer.sort(sortedColumns[sortedColumns.length - 1].roles['Category'] ? 'match' : 'value', lastColumn.sort != 1);
            }
        }
        else {
            this.mySlicer.data = [];
        }
    };
    /**
     * Converts the given dataview into a list of listitems
     */
    AdvancedSlicerVisual.converter = function (dataView, selectionManager) {
        var converted;
        var selectedIds = selectionManager.getSelectionIds() || [];
        var categorical = dataView && dataView.categorical;
        var values = [];
        if (categorical && categorical.values && categorical.values.length) {
            values = categorical.values[0].values;
        }
        var maxValue = 0;
        if (categorical && categorical.categories && categorical.categories.length > 0) {
            converted = categorical.categories[0].values.map(function (category, i) {
                var id = SelectionId.createWithId(categorical.categories[0].identity[i]);
                var item = {
                    match: category,
                    identity: id,
                    selected: !!_.find(selectedIds, function (oId) { return oId.equals(id); }),
                    value: values[i] || 0,
                    renderedValue: undefined,
                    equals: function (b) { return id.equals(b.identity); }
                };
                if (item.value > maxValue) {
                    maxValue = item.value;
                }
                return item;
            });
            var percentage = maxValue < 100 ? true : false;
            converted.forEach(function (c) {
                c.renderedValue = c.value ? (c.value / maxValue) * 100 : undefined;
            });
        }
        return converted;
    };
    /**
     * Gets the inline css used for this element
     */
    AdvancedSlicerVisual.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([require("!css!sass!./css/AdvancedSlicerVisual.scss")]);
    };
    /**
    * Gets the external css paths used for this visualization
    */
    AdvancedSlicerVisual.prototype.getExternalCssResources = function () {
        return _super.prototype.getExternalCssResources.call(this).concat(this.fontAwesome);
    };
    /**
     * Listener for when loading more data
     */
    AdvancedSlicerVisual.prototype.onLoadMoreData = function (item) {
        if (this.dataView.metadata.segment) {
            if (this.loadDeferred) {
                this.loadDeferred.reject();
            }
            this.loadDeferred = $.Deferred();
            item.result = this.loadDeferred.promise();
            this.host.loadMoreData();
        }
    };
    /**
     * Updates the data filter based on the selection
     */
    AdvancedSlicerVisual.prototype.onSelectionChanged = function (selectedItems) {
        var _this = this;
        var filter;
        this.selectionManager.clear();
        selectedItems.forEach(function (item) {
            _this.selectionManager.select(item.identity, true);
        });
        this.updateSelectionFilter();
    };
    /**
     * Updates the data filter based on the selection
     */
    AdvancedSlicerVisual.prototype.updateSelectionFilter = function () {
        var filter;
        if (this.selectionManager.hasSelection()) {
            var selectors = this.selectionManager.getSelectionIds().map(function (id) { return id.getSelector(); });
            filter = data.Selector.filterFromSelector(selectors);
        }
        var objects = {
            merge: [
                {
                    objectName: "general",
                    selector: undefined,
                    properties: {
                        "filter": filter
                    }
                }
            ]
        };
        this.host.persistProperties(objects);
    };
    /**
     * The set of capabilities for the visual
     */
    AdvancedSlicerVisual.capabilities = {
        dataRoles: [
            {
                name: 'Category',
                kind: VisualDataRoleKind.Grouping,
                displayName: powerbi.data.createDisplayNameGetter('Role_DisplayName_Field'),
                description: data.createDisplayNameGetter('Role_DisplayName_FieldDescription')
            }, {
                name: 'Values',
                kind: VisualDataRoleKind.Measure
            },
        ],
        dataViewMappings: [{
                conditions: [{ 'Category': { max: 1, min: 1 }, 'Values': { max: 1, min: 0 } }],
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                        dataReductionAlgorithm: { window: {} }
                    },
                    values: {
                        select: [{ bind: { to: "Values" } }]
                    },
                    includeEmptyGroups: true,
                }
            }],
        // Sort this crap by default
        sorting: {
            default: {}
        },
        objects: {
            general: {
                displayName: data.createDisplayNameGetter('Visual_General'),
                properties: {
                    filter: {
                        type: { filter: {} },
                        rule: {
                            output: {
                                property: 'selected',
                                selector: ['Values'],
                            }
                        }
                    },
                },
            } /*,
            sorting: {
                displayName: "Sorting",
                properties: {
                    byHistogram: {
                        type: { bool: true }
                    },
                    byName: {
                        type: { bool: true }
                    }
                }
            }*/
        }
    };
    AdvancedSlicerVisual = __decorate([
        Utils_1.Visual(require("./build").output.PowerBI)
    ], AdvancedSlicerVisual);
    return AdvancedSlicerVisual;
}(VisualBase_1.VisualBase));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdvancedSlicerVisual;
import { hasLayoutChanged, hasConfigurationChanged } from "./configuration";
import { ITableSorterConfiguration } from "./models";
import { expect } from "chai";

describe("configuration", () => {
    const CONFIG_WITH_LAYOUT_COLUMN_NAME = "HELLO";
    const CONFIG_WITH_LAYOUT_FILTER_TEXT = "FILTER_TEXT";
    const CONFIG_WITH_LAYOUT = () => (<ITableSorterConfiguration><any>{
        layout: {
            primary: [{
                column: CONFIG_WITH_LAYOUT_COLUMN_NAME,
            }],
        },
    });
    const CONFIG_WITH_LAYOUT_AND_FILTER = () => (<ITableSorterConfiguration><any>{
        layout: {
            primary: [{
                column: CONFIG_WITH_LAYOUT_COLUMN_NAME,
                filter: CONFIG_WITH_LAYOUT_FILTER_TEXT,
            }],
        },
    });
    describe("hasLayoutChanged", () => {
        it("should return false if only the rank column has changed", () => {
            const rankConfig = CONFIG_WITH_LAYOUT();
            // Add a rank column, otherwise identical
            rankConfig.layout.primary.push({
                type: "rank",
            });
            const result = hasLayoutChanged(rankConfig, CONFIG_WITH_LAYOUT());
            expect(result).to.be.false;
        });
        it("should return true if the old layout is undefined", () => {
            const result = hasLayoutChanged(undefined, CONFIG_WITH_LAYOUT());
            expect(result).to.be.true;
        });
        it("should return true if the new layout is undefined", () => {
            const result = hasLayoutChanged(CONFIG_WITH_LAYOUT(), undefined);
            expect(result).to.be.true;
        });
        it("should return false if both are undefined", () => {
            const result = hasLayoutChanged(undefined, undefined);
            expect(result).to.be.false;
        });
        it("should return true if the filters have changed", () => {
            const result = hasLayoutChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT_AND_FILTER());
            expect(result).to.be.true;
        });
        it("should return false if nothing has changed", () => {
            const result = hasLayoutChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT());
            expect(result).to.be.false;
        });
    });
    describe("hasConfigurationChanged", () => {
        it("should return true if the old configuration is undefined", () => {
            const result = hasConfigurationChanged(undefined, CONFIG_WITH_LAYOUT());
            expect(result).to.be.true;
        });
        it("should return true if the new configuration is undefined", () => {
            const result = hasConfigurationChanged(CONFIG_WITH_LAYOUT(), undefined);
            expect(result).to.be.true;
        });
        it("should return false if both are undefined", () => {
            const result = hasConfigurationChanged(undefined, undefined);
            expect(result).to.be.false;
        });
        it("should return true if the filters have changed within the layout", () => {
            const result = hasConfigurationChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT_AND_FILTER());
            expect(result).to.be.true;
        });
        it("should return false if nothing has changed within the layout", () => {
            const result = hasConfigurationChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT());
            expect(result).to.be.false;
        });
    });
});

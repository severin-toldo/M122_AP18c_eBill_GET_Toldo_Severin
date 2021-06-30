import {Column} from "./column.model";
import {Row} from "./row.model";
import {CommonUtils} from "../../common.utils";
import {Align} from "./align.enum";

export class Table {

    public columns: Column[] = [];
    public rows: Row[] = [];


    public toString(): string[] {
        const transformedRowValues: any[][] = this.columns.map(col => {
            let rowValues = this.rows
                .map(row => row.value[col.name])
                .map(value => '' + value + ''); // ensure that all are strings

            const longestRowValueLength: number = CommonUtils.getLongestStringLength(rowValues);

            return rowValues.map(rv => {
                rv = this.setAlignment(rv, longestRowValueLength, col);
                rv = this.setPadding(rv, col);

                return rv;
            });
        });

        // Ensure that all transformed row values have the same length and nothing went wrong during conversion
        const targetLength = transformedRowValues[0].length;
        const elementWithNotSameLength = transformedRowValues.filter(e => e.length !== targetLength);
        const doAllElementsHaveSameLength = elementWithNotSameLength && elementWithNotSameLength.length === 0;

        // should never happen
        if (!doAllElementsHaveSameLength) {
            throw new Error('Error while toString table. allValues elements have different lengths!');
        }

        // build final result
        const result = [];

        for (let i = 0; i < targetLength; i++) {
            result.push(transformedRowValues.map(e => e[i]).join(''));
        }

        return result;
    }

    private setAlignment(rowValue: string, longestRowValueLength: number, col: Column): string {
        if (rowValue.length !== longestRowValueLength) {
            // fill up with spaces based on alignment
            if (col.align === Align.RIGHT) {
                return CommonUtils.insertSpaces(longestRowValueLength - rowValue.length) + rowValue;
            } else {
                return rowValue + CommonUtils.insertSpaces(longestRowValueLength - rowValue.length);
            }
        }

        return rowValue;
    }

    private setPadding(rowValue: string, col: Column): string {
        if (col.paddingLeft) {
            rowValue = CommonUtils.insertSpaces(col.paddingLeft) + rowValue;
        }

        if(col.paddingRight) {
            rowValue = rowValue + CommonUtils.insertSpaces(col.paddingRight);
        }

        return rowValue;
    }

}

import {Recipient} from "../recipient.model";
import {Customer} from "../customer.model";
import {InvoicePartEntry} from "./part.model";

export class Invoice {
    public invoiceNumber: string;
    public orderNumber: string;
    public creationPlace: string;
    public creationDate: Date;
    public paymentTarget: Date;
    public paymentTargetInDays: number;
    public recipient: Recipient;
    public customer: Customer;
    public partEntries: InvoicePartEntry[];
}

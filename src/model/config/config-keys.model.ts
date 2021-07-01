import {ConfigKey} from "./config-key.model";

/*
 * ConfigKeys. Each key represent a config key or a command line argument
 * @author Severin Toldo
 * */
export class ConfigKeys {

    public static values(): ConfigKey[] {
        return [
            this.CONFIG_FILE,
            this.LOG_FILE_PATH,
            this.CUSTOMER_SYSTEM_FTP_HOST,
            this.CUSTOMER_SYSTEM_FTP_USER,
            this.CUSTOMER_SYSTEM_FTP_PASSWORD,
            this.PAYMENT_SYSTEM_FTP_HOST,
            this.PAYMENT_SYSTEM_FTP_USER,
            this.PAYMENT_SYSTEM_FTP_PASSWORD,
            this.INVOICE_GET_FTP_LOCATION,
            this.INVOICE_PUT_FTP_LOCATION,
        ];
    }

    public static readonly CONFIG_FILE: ConfigKey = {
        key: 'configFile',
        required: false
    };

    public static readonly LOG_FILE_PATH: ConfigKey = {
        key: 'logFile',
        required: false
    };

    public static readonly CUSTOMER_SYSTEM_FTP_HOST: ConfigKey = {
        key: 'customerSystemFtpHost',
        required: true
    };

    public static readonly CUSTOMER_SYSTEM_FTP_USER: ConfigKey = {
        key: 'customerSystemFtpUser',
        required: true
    };

    public static readonly CUSTOMER_SYSTEM_FTP_PASSWORD: ConfigKey = {
        key: 'customerSystemFtpPassword',
        required: true
    };

    public static readonly PAYMENT_SYSTEM_FTP_HOST: ConfigKey = {
        key: 'paymentSystemFtpHost',
        required: true
    };

    public static readonly PAYMENT_SYSTEM_FTP_USER: ConfigKey = {
        key: 'paymentSystemFtpUser',
        required: true
    };

    public static readonly PAYMENT_SYSTEM_FTP_PASSWORD: ConfigKey = {
        key: 'paymentSystemFtpPassword',
        required: true
    };

    public static readonly INVOICE_GET_FTP_LOCATION: ConfigKey = {
        key: 'invoicesGetFtpLocation',
        required: true
    };

    public static readonly INVOICE_PUT_FTP_LOCATION: ConfigKey = {
        key: 'invoicesPutFtpLocation',
        required: true
    };

}

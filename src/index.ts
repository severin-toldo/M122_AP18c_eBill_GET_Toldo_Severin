// #!/usr/bin/env node

import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {FtpService} from "./service/ftp.service";
import {FileService} from "./service/file.service";
import {CommonUtils} from "./common.utils";
import {ErrorCode} from "./model/error-code/error-code.enum";
import {ErrorCodeError} from "./model/error-code/error-code-error.model";
import {of} from "rxjs";
import {ConfigKeys} from "./model/config/config-keys.model";
import {CsvToInvoiceConverter} from "./converter/csv-to-invoice.converter";
import {InvoiceToTxtConverter} from "./converter/invoice-to-txt.converter";
import {InvoiceToXmlConverter} from "./converter/invoice-to-xml.converter";

/*
 * Main Script file
 * @author Severin Toldo
 * */


// typescript runtime declares
declare function require(name: string);
declare const process: {argv: any};


// requires
const OS = require('os');
const FS = require('fs');
const ARGS = require('minimist')(process.argv.slice(2)); // library to parse command line arguments
const FTP = require( 'ftp' );
const ARCHIVER = require('archiver');
const MD5 = require('md5');
const NODEMAILER = require('nodemailer');
const ZIPPER = require('zip-local');
const WINSTON = require('winston');
const { format } = require('logform');
const CSV_TO_JSON = require('csvtojson');
var DATE_FORMAT = require("dateformat");


// services
const fileService = new FileService(FS, OS, ARCHIVER, MD5, ZIPPER);
const ftpService = new FtpService(new FTP(), FS, fileService); // new FTP() -> library's ftp client needs to be initialized like this, don't ask me why


// global constants
const SCRIPT_NAME = 'eBillGet';
const DEFAULT_CONFIG_FILE_NAME = 'ebill-get-config.json';
const DEFAULT_CONFIG_FILE_PATH = fileService.getHomeDirPath() + '/' + DEFAULT_CONFIG_FILE_NAME;
const CONFIG = buildConfig();

const LOG_FILE_PATH = CommonUtils.getConfigKeyValue(ConfigKeys.LOG_FILE_PATH, CONFIG);
const CUSTOMER_SYSTEM_FTP_HOST = CommonUtils.getConfigKeyValue(ConfigKeys.CUSTOMER_SYSTEM_FTP_HOST, CONFIG);
const CUSTOMER_SYSTEM_FTP_USER = CommonUtils.getConfigKeyValue(ConfigKeys.CUSTOMER_SYSTEM_FTP_USER, CONFIG);
const CUSTOMER_SYSTEM_FTP_PASSWORD = CommonUtils.getConfigKeyValue(ConfigKeys.CUSTOMER_SYSTEM_FTP_PASSWORD, CONFIG);
const PAYMENT_SYSTEM_FTP_HOST = CommonUtils.getConfigKeyValue(ConfigKeys.PAYMENT_SYSTEM_FTP_HOST, CONFIG);
const PAYMENT_SYSTEM_FTP_USER = CommonUtils.getConfigKeyValue(ConfigKeys.PAYMENT_SYSTEM_FTP_USER, CONFIG);
const PAYMENT_SYSTEM_FTP_PASSWORD = CommonUtils.getConfigKeyValue(ConfigKeys.PAYMENT_SYSTEM_FTP_PASSWORD, CONFIG);
const INVOICE_GET_FTP_LOCATION = CommonUtils.getConfigKeyValue(ConfigKeys.INVOICE_GET_FTP_LOCATION, CONFIG);
const INVOICE_PUT_FTP_LOCATION = CommonUtils.getConfigKeyValue(ConfigKeys.INVOICE_PUT_FTP_LOCATION, CONFIG);

const LOGGER = buildLogger();


// business logic
// TODO implement













// helper functions
function buildConfig(): any {
    const defaultConfigFile = resolveConfigFile(DEFAULT_CONFIG_FILE_PATH);
    const argumentConfigFile = resolveConfigFile(CommonUtils.getConfigKeyValue(ConfigKeys.CONFIG_FILE, ARGS));

    const config = {};

    // command line argument overwrite config values, custom config overwrites default config
    ConfigKeys.values().forEach(configKey => {
        if (CommonUtils.isConfigKeyPresent(configKey, ARGS)) {
            config[configKey.key] = CommonUtils.getConfigKeyValue(configKey, ARGS);
        } else if (CommonUtils.isConfigKeyPresent(configKey, argumentConfigFile)) {
            config[configKey.key] = CommonUtils.getConfigKeyValue(configKey, argumentConfigFile);
        } else if (CommonUtils.isConfigKeyPresent(configKey, defaultConfigFile)) {
            config[configKey.key] = CommonUtils.getConfigKeyValue(configKey, defaultConfigFile);
        }
    });

    validateConfig(config);

    return config;
}

function resolveConfigFile(path: string): any {
    if (fileService.doesFileExist(path)) {
        const fileContent = fileService.getFileContent(path);

        if (CommonUtils.isValidJson(fileContent)) {
            return JSON.parse(fileContent);
        }
    }

    return null;
}

// all required config keys must be set
function validateConfig(config: any): void {
    ConfigKeys.values().forEach(configKey => {
        if (configKey.required && !CommonUtils.isConfigKeyPresent(configKey, config)) {
            throw new Error('Required config key missing! ' + configKey.key);
        }
    });
}

function buildLogger(): any {
    const formatFunction = (data: any) => {
        return `${data.timestamp} - ${data.level.toUpperCase()} ${SCRIPT_NAME}: ${data.message.trim()}`;
    };

    const logfileFormat = format.combine(
        format.timestamp(),
        format.align(),
        format.printf(info => formatFunction(info))
    );

    const consoleFormat = format.combine(
        format.timestamp(),
        format.align(),
        format.printf(data => WINSTON.format.colorize().colorize(data.level, formatFunction(data)))
    );

    const transports = [new WINSTON.transports.Console({ format: consoleFormat })];

    if (LOG_FILE_PATH) {
        transports.push(new WINSTON.transports.File({ filename: LOG_FILE_PATH, format: logfileFormat }));
    }

    return WINSTON.createLogger({
        transports: transports,
    });
}




































// const csvFilePath = '/Users/stoldo/Downloads/my_invoice.data';
// const csv = fileService.getFileContent(csvFilePath);
//
//
// const converter = new CsvToInvoiceConverter(CSV_TO_JSON);
//
// converter.convert(csv).subscribe(invoice => {
//     console.log(invoice);
//
//     // const invoiceToTxtConverter = new InvoiceToTxtConverter(DATE_FORMAT);
//     // const result = invoiceToTxtConverter.convert(invoice);
//
//     const invoiceToXmlConverter = new InvoiceToXmlConverter(DATE_FORMAT);
//     const result = invoiceToXmlConverter.convert(invoice);
//     console.log(result);
//
//     fileService.writeToFile('/Users/stoldo/Downloads/my_invoice.xml', result);
// });








// 1.) Automatisches (regelmässiges) Abholen der Rechnungsaufträge des Kunden/Rechnungssteller
// (Abholserver) inkl. dem Löschen der Datei auf dem Abholserver
// per FTP (Kundensystem/out/[KlasseUndIhrNachname])
// FTP-Server: ftp.haraldmueller.ch
// Benutzer: schoolerinvoices
// Passwort: Berufsschule8005!

// 2.) Verarbeitung der Rechnungsaufträge zu einer korrekten und druckbaren
// Papierrechnung (…invoice.txt) und einer maschinell verarbeitbaren XML-Rechnung (…invoice.xml)

// 3.) Abgabe der Rechnung als TXT und XML auf dem Abgabeserver
// (Zahlungssystem/in/[KlasseUndIhrNachname]) per FTP
// FTP-Server: 134.119.225.245
// Benutzer: 310721-297-zahlsystem
// Passwort: Berufsschule8005!










// business logic
// logger.info('Starting ' + SCRIPT_NAME);
//
//
// const fileToBackupName = fileService.getFileName(FILE_TO_BACKUP_PATH);
// const backupFilePath = FTP_BACKUP_LOCATION + FileService.SEPARATOR + buildBackupFileName(fileToBackupName);
// const confirmationFilePath = fileService.getTmpDirPath() + FileService.SEPARATOR + fileToBackupName;
//
// ftpService
//     .connect(FTP_HOST, FTP_USER, FTP_PASSWORD)
//     .pipe(
//         tap(() => logger.info('Uploading file...')),
//         switchMap(() => ftpService.upload(FILE_TO_BACKUP_PATH, backupFilePath)),
//         tap(() => logger.info('Uploading file done.')),
//         tap(() => logger.info('Verifying uploaded file...')),
//         switchMap(() => ftpService.download(backupFilePath, confirmationFilePath)),
//         switchMap(() => ftpService.disconnect()),
//         map(() => {
//             const originalFileSize = fileService.getFileSize(FILE_TO_BACKUP_PATH);
//             const downloadedFileSize = fileService.getFileSize(confirmationFilePath);
//
//             if (originalFileSize !== downloadedFileSize) {
//                 throw new ErrorCodeError(ErrorCode.FILES_NOT_THE_SAME, new Error('file sizes are not equal!'));
//             }
//
//             const originalFileMd5Checksum = fileService.getFileMd5Checksum(FILE_TO_BACKUP_PATH);
//             const downloadedFileMd5Checksum = fileService.getFileMd5Checksum(confirmationFilePath);
//
//             if (originalFileMd5Checksum !== downloadedFileMd5Checksum) {
//                 throw new ErrorCodeError(ErrorCode.FILES_NOT_THE_SAME, new Error('file checksums are not equal!'));
//             }
//
//             fileService.deleteFile(confirmationFilePath);
//
//             const zippedFileBuffer = fileService.zipFile(FILE_TO_BACKUP_PATH);
//
//             logger.info('Verifying uploaded file done.');
//             return {status: 'success', payload: zippedFileBuffer};
//         }),
//         tap(() => logger.info('Backup successful.')),
//         catchError(error => {
//             logger.error('Backup failed. ' + error.errorCode);
//             return of({status: 'error', payload: error.errorCode});
//         }),
//         switchMap(status => {
//             if (DO_SEND_MAIL) {
//                 logger.info('Sending E-Mail...');
//
//                 const mailOptions: any = {
//                     from: 'auto@backup.com',
//                     to: EMAIL_TO,
//                     subject: 'AutoBackup Status E-Mail - ' + CommonUtils.getCurrentDateFormatted(),
//                 };
//
//                 if (status.status === 'success') {
//                     mailOptions.text = 'Backup Successful.';
//                     mailOptions.attachments = [
//                         {
//                             filename: fileToBackupName + '.zip',
//                             content: status.payload
//                         }
//                     ];
//                 } else {
//                     mailOptions.text = 'Backup failed: ' + status.payload;
//                 }
//
//                 return emailService
//                     .createTransporter(EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD)
//                     .sendEmail(mailOptions);
//             }
//
//             return of(null);
//         }),
//     )
//     .subscribe(() => {
//         if (DO_SEND_MAIL) {
//             logger.info('Sending E-Mail done.');
//         } else {
//             logger.warn('No E-Mail sent.');
//         }
//
//         logger.info('Stopping AutoBackup.');
//     }, error => {
//         logger.error('Sending E-Mail failed.');
//         logger.info('Stopping AutoBackup.');
//
//         throw error;
//     });




import {Observable, race, Subject} from "rxjs";
import {map} from "rxjs/operators";
import {Status} from "../model/status.model";
import {CommonUtils} from "../common.utils";
import {FileService} from "./file.service";
import {ErrorCodeError} from "../model/error/error-code.error";
import {ErrorCode} from "../model/error/error-code.enum";
import {FtpFileResponse} from "../model/ftp/ftp-file-response.model";
import {FtpFileType} from "../model/ftp/ftp-file-type.enum";
import {FtpClient} from "../model/ftp/ftp-client.model";
import {CustomError} from "../model/error/custom.error";

/*
 * FtpService
 * @author Severin Toldo
 * */
export class FtpService {

    constructor(private fileService: FileService) {
    }

    public upload(ftpClient: FtpClient, sourcePath: string, targetPath: string): Observable<Status> {
        return Observable.create(observer => {
            ftpClient.prepare().put(sourcePath, targetPath, (error, response) => {
                // library doesn't check if file exists
                if (!this.fileService.doesFileExist(sourcePath)) {
                    observer.next({status: 'error', payload: new ErrorCodeError(ErrorCode.UPLOAD_FAILED, new Error('Invalid source path, file does not exist! ' + sourcePath))});
                    return;
                }

                if (error) {
                    observer.next({status: 'error', payload: new CustomError(ErrorCode.UPLOAD_FAILED.toString() + ' for file ' + sourcePath, error)});
                    return;
                }

                observer.next({status: 'success', payload: sourcePath});
            });
        })
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }

    public download(ftpClient: FtpClient, sourcePath: string): Observable<Status> {
        const _this = this;

        return Observable.create(observer => {
            ftpClient.prepare().get(sourcePath, (error, stream) => {
                if (error) {
                    observer.next({status: 'error', payload: new CustomError(ErrorCode.DOWNLOAD_FAILED.toString() + ' for file ' + sourcePath, error)});
                    return;
                }

                // stream to string
                let fileContentAsString = '';

                stream.on('data', (data) => {
                    fileContentAsString += data.toString();
                });

                stream.on('end', () => {
                    const fileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
                    observer.next({status: 'success', payload: {fileName: fileName, fileData: fileContentAsString}});
                });

                stream.on('error', error => {
                    observer.next({status: 'error', payload: new CustomError(ErrorCode.DOWNLOAD_FAILED.toString() + ' for file ' + sourcePath, error)});
                });
            });
        })
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }

    public list(ftpClient: FtpClient, path: string): Observable<Status> {
        return Observable.create(observer => {
            ftpClient.prepare().list(path, (error, response) => {
                if (error) {
                    observer.next({status: 'error', payload: new CustomError(ErrorCode.FETCHING_LIST_FAILED.toString() + ' for path ' + path, error)});
                    return;
                }

                const list = response.map(e => {
                    const ftpFileResponse = new FtpFileResponse();
                    ftpFileResponse.name = e.name;
                    ftpFileResponse.type = e.type === 'd' ? FtpFileType.DIRECTORY : FtpFileType.FILE;

                    return ftpFileResponse;
                });

                observer.next({status: 'success', payload: list});
            });
        })
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }

    public delete(ftpClient: FtpClient, path: string): Observable<Status> {
        return Observable.create(observer => {
            ftpClient.prepare().delete(path, (error) => {
                if (error) {
                    observer.next({status: 'error', payload: new CustomError(ErrorCode.DELETE_FAILED.toString() + ' for path ' + path, error)});
                    return;
                }

                observer.next({status: 'success'});
            });
        })
            .pipe(map((status: Status) => CommonUtils.handleStatus(status)));
    }
}

import {Status} from "../status.model";
import {ErrorCodeError} from "../error/error-code.error";
import {ErrorCode} from "../error/error-code.enum";
import {CommonUtils} from "../../common.utils";
import {Observable, Subject, race} from "rxjs";
import {map} from "rxjs/operators";

export class FtpClient {

    private ftpClient: any;
    private ftpClientConnected$ = new Subject<Status>();
    private ftpClientDisconnected$ = new Subject<Status>();
    private ftpClientError$ = new Subject<Status>();


    constructor(private ftp: any,
                private host: string,
                private user: string,
                private password: string) {
        this.ftpClient = new ftp();
        this.ftpClient.on('ready', () => this.ftpClientConnected$.next({status: 'connected'}));
        this.ftpClient.on('end', () => this.ftpClientDisconnected$.next({status: 'disconnected'}));
        this.ftpClient.on('error', (error) => this.ftpClientError$.next({status: 'error', payload: new ErrorCodeError(ErrorCode.FTP_CONNECTION_FAILED, error)}));
    }

    public connect(): Observable<Status> {
        this.ftpClient.connect({
            'host': this.host,
            'user': this.user,
            'password': this.password
        });

        return race(
            this.ftpClientConnected$,
            this.ftpClientError$
        )
            .pipe(map(status => CommonUtils.handleStatus(status)))
    }

    // TODO find good solution to disconnect
    public disconnect(): Observable<Status> {
        this.ftpClient.end();

        return race(
            this.ftpClientDisconnected$,
            this.ftpClientError$
        )
            .pipe(map(status => CommonUtils.handleStatus(status)))
    }

    public prepare(): any {
        return this.ftpClient;
    }

}

import React from "react";

import {Chapter} from "../models/chapter";
import {AxiosError, AxiosResponse} from "axios";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import {BookResult} from "../models/bookResult";
import ProgressBar from "react-bootstrap/ProgressBar";
import {BackendAdapter} from "../adapters/BackendAdapter";

interface Props {
    chapters: Chapter[];
    onError: (error: AxiosError) => void;
}

interface State {
    processing: boolean;
    intervalId: number
    percent: number
    animatedProgress: boolean
}


export class DownloadContainer extends React.Component<Props, State> {
    state = {
        processing: false,
        percent: 0,
        intervalId: 0,
        animatedProgress: false,

    };

    render() {

        let progressBar = <div/>;
        if (this.state.processing) {
            if (this.state.animatedProgress) {
                progressBar = <ProgressBar animated now={100}/>
            } else {
                progressBar = <ProgressBar now={this.state.percent} label={`${Math.round(this.state.percent)}%`}/>
            }
        }

        if (this.props.chapters.length > 0) {
            return (
                <div>
                    <Button onClick={this.onDownload}
                            disabled={this.state.processing}>Download {this.state.processing &&
                    <Spinner as="span"
                             animation="border"
                             size="sm"
                             role="status"
                             aria-hidden="true">
                      <span className="sr-only">Loading...</span>
                    </Spinner>}</Button>
                    <p className="text-muted">
                        The reddit API used under the hood imposes rate limiting.
                        Therefor only approximately one chapter per second can be processed.
                        So please be patient when creating books with manny pages.
                    </p>
                    {progressBar}

                </div>
            );
        } else {
            return <div>
                Add chapters to enable download
            </div>
        }
    }

    componentWillUnmount = (): void => {
        // use intervalId from the state to clear the interval
        this.stopTimer();
    };

    private stopTimer() {
        clearInterval(this.state.intervalId);
    }

    private timer = (increment: number): void => {
        // If we were to optimistic fade timer into undefined animated behaviour
        if (this.state.percent + increment > 100) {
            this.stopTimer();
            this.setState((previousState: State) => ({
                animatedProgress: true
            }));
        } else {
            this.setState((previousState: State) => ({
                percent: previousState.percent ? previousState.percent + increment : increment
            }));
        }
    };

    private onDownload = (): void => {
        let that = this;
        let numberOfChapters = that.props.chapters.length;
        this.startProcessing(numberOfChapters);

        BackendAdapter.getEpubFromChapters(this.props.chapters)
            .then(function (response: AxiosResponse<BookResult>) {
                let data = response.data;

                // 2. Create blob link to download
                const url = window.URL.createObjectURL(that.b64toBlob(data.content, data.mimeType));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', data.fileName);
                // 3. Append to html page
                document.body.appendChild(link);
                // 4. Force download
                link.click();
                // 5. Clean up and remove the link
                link.parentNode?.removeChild(link);

            })
            .catch(function (error: AxiosError) {
                that.props.onError(error)
            }).finally(function () {
            that.stopProcessing();
        });
    };

    private stopProcessing() {
        this.stopTimer();
        this.setState({
            processing: false,
        });
    }

    private startProcessing(numberOfChapters: number) {
        let increment = (100 / numberOfChapters) * 1.1;
        var intervalId = setInterval(this.timer.bind(this, increment), 1000);
        // store intervalId in the state so it can be accessed later:
        this.setState({
            intervalId: intervalId,
            processing: true,
            percent: 0,
            animatedProgress: false
        });
    }

// stolen from https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    private b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }
}

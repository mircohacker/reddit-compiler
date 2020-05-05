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
}


export class DownloadContainer extends React.Component<Props, State> {
    state = {
        processing: false,
    };

    render() {

        let progressBar = <div/>;
        if (this.state.processing) {
            progressBar = <ProgressBar animated now={100}/>
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
                        The reddit API used under the hood imposes rate limiting. So the creation of the epub can take
                        some time especially with many chapters
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

    private onDownload = (): void => {
        let that = this;
        this.startProcessing();

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
        this.setState({
            processing: false,
        });
    }

    private startProcessing() {
        this.setState({
            processing: true,
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

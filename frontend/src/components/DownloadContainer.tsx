import React, {FunctionComponent, useState} from "react";

import {Chapter} from "../models/chapter";
import {AxiosError, AxiosResponse} from "axios";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import ProgressBar from "react-bootstrap/ProgressBar";
import {getEpubFromChapters} from "../adapters/BackendAdapter";
import {BookResult} from "../models/bookResult";

interface Props {
    chapters: Chapter[];
    onError: (error: AxiosError) => void;
}

// stolen from https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
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


export const DownloadContainer: FunctionComponent<Props> = (props) => {

    const [processing, setProcessing] = useState(false);

    const onDownload = (): void => {
        setProcessing(true)

        getEpubFromChapters(props.chapters)
            .then(function (response: AxiosResponse<BookResult>) {
                let data = response.data;

                // 2. Create blob link to download
                const url = window.URL.createObjectURL(b64toBlob(data.content, data.mimeType));
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
                props.onError(error)
            }).finally(function () {
            setProcessing(false)
        });
    };

    let progressBar = <div/>;
    if (processing) {
        progressBar = <ProgressBar animated now={100}/>
    }

    if (props.chapters.length > 0) {
        return (
            <div>
                <Button onClick={onDownload}
                        disabled={processing}>Download {processing &&
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

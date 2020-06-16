import React, {FunctionComponent, useState} from 'react';
import './App.css';
import {AnchorUrl} from "./components/AnchorUrl";

import {Chapter} from "./models/chapter";
import {ChapterList} from "./components/ChapterList";
import {DownloadContainer} from "./components/DownloadContainer";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import styled from "styled-components";
import Alert from "react-bootstrap/Alert";
import {AxiosError} from "axios";
import {FooterComponent} from "./components/FooterComponent";


const ComponentContainer = styled.div`
padding: 8px;
margin: 8px;
border: 2px solid lightgrey;
border-radius: 5px;
`;


export const App: FunctionComponent = (props) => {
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [errorMessage, setErrorMessage] = useState("");

    const onChapterAppend = (newChapters: Chapter[]) => {
        // remove the duplicates and keep only the first occurrence of each chapter id
        setChapters(chapters.concat(newChapters)
            .filter((chapter, index, self) =>
                index === self.findIndex((c) => (
                    c.id === chapter.id
                ))
            )
        )
    };

    const onRequestError = (error: AxiosError) => {
        let message = "The network request was not successful.";
        // Error 😨
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            message = `The request failed with code ${error.response.status} ${error.response.statusText}. The message was ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            message = `The network request failed because: ${error.message}`;
            console.log(error)
        } else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
        setErrorMessage(message)
    };

    const onChapterListUpdate = (chapters: Chapter[]) => {
        setChapters(chapters)
    };

    // TODO describe how app works
    return (<div>
        <Container>
            <Jumbotron>
                <h1 className="header">
                    Reddit serial compiler
                </h1>
                <h2>
                    Convert your favourite reddit fiction into a convenient ebook!!
                </h2>
            </Jumbotron>
            {errorMessage &&
            <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
                {errorMessage}
            </Alert>}
            <ComponentContainer>
                <AnchorUrl onSubmit={onChapterAppend} onError={onRequestError}/>
            </ComponentContainer>
            <ComponentContainer>
                <ChapterList chapters={chapters}
                             onChapterListUpdate={onChapterListUpdate}/>
            </ComponentContainer>
            <ComponentContainer>
                <DownloadContainer chapters={chapters} onError={onRequestError}/>
            </ComponentContainer>
            <FooterComponent/>
        </Container>
    </div>)
}

export default App;

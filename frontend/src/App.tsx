import React, {Component} from 'react';
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

interface State {
    errorMessage?: string;
    chapters: Chapter[];
}

const ComponentContainer = styled.div`
padding: 8px;
margin: 8px;
border: 2px solid lightgrey;
border-radius: 5px;
`;


class App extends Component<{}, State> {
    state = {
        chapters: [],
        errorMessage: undefined
    };

    render() {
        // TODO describe how app works
        return (<div>
                <Container>
                    <Jumbotron>
                        <h1 className="header">
                            Reddit serial compiler
                        </h1>
                        <h2>
                            Convert your favourite reddit fiction into a convenient ebook!
                        </h2>
                    </Jumbotron>
                    {this.state.errorMessage &&
                    <Alert variant="danger" onClose={() => this.setState({errorMessage: undefined})} dismissible>
                        {this.state.errorMessage}
                    </Alert>}
                    <ComponentContainer>
                        <AnchorUrl onSubmit={this.onChapterAppend} onError={this.onRequestError}/>
                    </ComponentContainer>
                    <ComponentContainer>
                        <ChapterList chapters={this.state.chapters}
                                     onChapterListUpdate={this.onChapterListUpdate}/>
                    </ComponentContainer>
                    <ComponentContainer>
                        <DownloadContainer chapters={this.state.chapters} onError={this.onRequestError}/>
                    </ComponentContainer>
                    <FooterComponent/>
                </Container>
            </div>
        );
    }

    private onChapterAppend = (chapters: Chapter[]) => {
        // remove the duplicates and keep only the first occurrence of each chapter id
        this.setState((previousState: State) => ({
            chapters: previousState.chapters.concat(chapters)
                .filter((chapter, index, self) =>
                    index === self.findIndex((c) => (
                        c.id === chapter.id
                    ))
                ),
        }));
    };

    private onChapterListUpdate = (chapters: Chapter[]) => {
        this.setState({
            chapters: chapters,
        })
    };

    private onRequestError = (error: AxiosError) => {
        let errorMessage = "The network request was not successful.";
        // Error 😨
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            errorMessage = `The request failed with code ${error.response.status} ${error.response.statusText}. The message was ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            errorMessage = `The network request failed because: ${JSON.stringify(error)}`;
            console.log(error)
        } else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
        this.setState({
            errorMessage: errorMessage
        });
    };
}

export default App;

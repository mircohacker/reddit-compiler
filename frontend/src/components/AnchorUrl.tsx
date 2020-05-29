import React, {ChangeEvent, FormEvent, FunctionComponent, useState} from "react";
import {Chapter} from "../models/chapter";
import {AxiosError, AxiosResponse} from "axios";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import {ChapterOverview} from "../models/chapterOverview";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Accordion from "react-bootstrap/Accordion";
import {getChapters} from "../adapters/BackendAdapter";

interface AnchorProps {
    onSubmit: (chapters: Chapter[]) => void;
    onError: (error: AxiosError) => void;
}

export const AnchorUrl: FunctionComponent<AnchorProps> = (props) => {

    const [url, setUrl] = useState("https://www.reddit.com/r/HFY/comments/flx9ae/the_galactic_archives_present_humanity_part_2/");
    const [processing, setProcessing] = useState(false);
    const [searchTermLength, setSearchTermLength] = useState(2);
    const [allReddit, setAllReddit] = useState(false);
    const [result, setResult] = useState<ChapterOverview | undefined>();

    const onAnchorSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setProcessing(true);

        getChapters(url, searchTermLength, allReddit)
            .then(function (response: AxiosResponse<ChapterOverview>) {
                props.onSubmit(response.data.chapters);
                setResult(response.data);
            })
            .catch(function (error: AxiosError) {
                props.onError(error)
            }).finally(function () {
                setProcessing(false);
            }
        );
    };

    return (
        <div>
            <Form onSubmit={onAnchorSubmit}>
                <Form.Group>
                    <Form.Label className={"full-width"}>
                        URL of one chapter
                        <Form.Control type="url" required value={url}
                                      onChange={(e: ChangeEvent<HTMLInputElement>) => (setUrl(e.target.value))}/>
                    </Form.Label>
                    <Form.Text className="text-muted">Just paste the full URL to one of the chapters of the series
                        you want.</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Accordion>
                        <Accordion.Toggle as={Button} variant="link" eventKey={"additionalOptionsCollapse"}>
                            Click here for additional options
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={"additionalOptionsCollapse"}>
                            <Row>
                                <Col>
                                    <Form.Group as={Col} controlId="formGridCity">
                                        <Form.Label>Search term length</Form.Label>
                                        <Form.Control type="number" min="0" value={searchTermLength}
                                                      onChange={(e: ChangeEvent<HTMLInputElement>) => (setSearchTermLength(e.target.valueAsNumber))}/>
                                        <Form.Text className="text-muted">How many words from the start of the given
                                            chapter should be used as search term.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group as={Col} controlId="formGridCity">
                                        <p>Search over all subreddits</p>

                                        <Button size="sm" style={{width: "4em"}}
                                                variant={allReddit ? "primary" : "secondary"}
                                                onClick={() => setAllReddit((prevState) => (!prevState))}>
                                            {allReddit ? "Yay" : "Nay"}
                                        </Button>
                                        <Form.Text className="text-muted">With no only the subreddit of the provided
                                            chapter is searched. With yes all of reddit will be searched for
                                            chapters of this author.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Accordion.Collapse>
                    </Accordion>
                </Form.Group>
                <Button variant="primary" type="submit" disabled={processing}>
                    Add Chapters {processing &&
                <Spinner as="span"
                         animation="border"
                         size="sm"
                         role="status"
                         aria-hidden="true">
                  <span className="sr-only">Loading...</span>
                </Spinner>}
                </Button>
                {result?.author &&
                <Card.Body>
                  <Row>
                    <Col>
                      Author: <a target="_blank" rel="noopener noreferrer"
                                 href={"https://www.reddit.com/user/" + result?.author}
                    >{result?.author}</a>
                    </Col>
                    <Col>
                      <div>Search Term: [{result?.search_term}]</div>
                      <div className={"text-muted"}>This term is used to search for chapters.</div>
                    </Col>
                  </Row>
                </Card.Body>}
            </Form>
        </div>
    );
};
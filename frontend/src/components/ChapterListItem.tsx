import React from "react";

import {Chapter} from "../models/chapter";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import TrashIcon from "./TrashIcon";
import ReactMarkdown from "react-markdown";


interface Props {
    chapter: Chapter;
    index: number;
    onDelete: (chapter: Chapter) => void
}

export class ChapterListItem extends React.Component<Props> {

    render() {
        return (
            <Card>
                <Accordion.Toggle as={Card.Header} eventKey={this.props.chapter.id}>
                    {this.props.chapter.title}
                    <Button variant="light" className="float-right" onClick={this.onDeleteClick}><TrashIcon/></Button>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={this.props.chapter.id}>
                    <Card.Body>
                        <ReactMarkdown source={this.props.chapter.snippet}/>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        );
    }

    private onDeleteClick = (): void => {
        this.props.onDelete(this.props.chapter);
    }
}
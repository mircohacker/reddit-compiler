import React, {FunctionComponent, useState} from "react";

import {Chapter} from "../models/chapter";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import TrashIcon from "./TrashIcon";
import ReactMarkdown from "react-markdown";


interface Props {
    chapter: Chapter;
    index: number;
    onDelete: (chapter: Chapter) => void
}

export const ChapterListItem: FunctionComponent<Props> = (props) => {

    const onDeleteClick = (): void => {
        props.onDelete(props.chapter);
    }

    const [visibleBody, setVisibleBody] = useState(false);

    return (
        <Card>
            <Card.Header onClick={() => {
                setVisibleBody(!visibleBody)
            }}>
                {props.chapter.title}
                <Button variant="light" className="float-right" onClick={onDeleteClick}><TrashIcon/></Button>
            </Card.Header>
            {visibleBody && <Card.Body>
              <ReactMarkdown source={props.chapter.snippet}/>
            </Card.Body>}
        </Card>
    );
}
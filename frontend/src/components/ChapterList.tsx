import React from "react";

import {ChapterListItem} from "./ChapterListItem";
import {Chapter} from "../models/chapter";
import styled from "styled-components";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import Accordion from "react-bootstrap/Accordion";

const ListContainer = styled.div`

`;
const ItemContainer = styled.div`

`;

interface Props {
    chapters: Chapter[];
    onChapterListUpdate: (chapters: Chapter[]) => void;
}

export class ChapterList extends React.Component<Props> {

    render() {
        // TODO MULTI drag https://github.com/atlassian/react-beautiful-dnd/tree/master/stories/src/multi-drag
        // TODO better performance for big lists
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <h2>List of Chapters</h2>
                <p className="text-muted">Here you see the list of fetched chapters. You can rearrange chapters via drag
                    and drop. If you click on a chapter you will see a small preview of the chapter.</p>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <ListContainer
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            <Accordion>
                                {this.props.chapters.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided, snapshot) => (
                                        <ItemContainer key={item.id}
                                             ref={provided.innerRef}
                                             {...provided.draggableProps}
                                             {...provided.dragHandleProps}>
                                            <ChapterListItem chapter={item}
                                                             index={index}
                                                             onDelete={this.onDeleteChapter}
                                            />
                                        </ItemContainer>)}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </Accordion>
                        </ListContainer>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }

    private onDeleteChapter = (chapter: Chapter) => {
        let new_Chapters = this.props.chapters.filter((value, index) => value.id !== chapter.id);
        this.props.onChapterListUpdate(new_Chapters);
    };

    private onDragEnd = (result: DropResult) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items: Chapter[] = this.reorder(
            this.props.chapters,
            result.source.index,
            result.destination.index
        );

        this.props.onChapterListUpdate(items);
    };
    reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        result.splice(endIndex, 0, result.splice(startIndex, 1)[0]);

        return result;
    };
}
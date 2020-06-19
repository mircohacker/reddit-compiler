import React, {FunctionComponent} from "react";

import {ChapterListItem} from "./ChapterListItem";
import {Chapter} from "../models/chapter";
import styled from "styled-components";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";

const ListContainer = styled.div`

`;
const ItemContainer = styled.div`

`;

interface Props {
    chapters: Chapter[];
    onChapterListUpdate: (chapters: Chapter[]) => void;
}

export const ChapterList: FunctionComponent<Props> = (props) => {


    const reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        result.splice(endIndex, 0, result.splice(startIndex, 1)[0]);

        return result;
    };

    const onDeleteChapter = (chapter: Chapter) => {
        let new_Chapters = props.chapters.filter((value, index) => value.id !== chapter.id);
        props.onChapterListUpdate(new_Chapters);
    };

    const onDragEnd = (result: DropResult) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items: Chapter[] = reorder(
            props.chapters,
            result.source.index,
            result.destination.index
        );

        props.onChapterListUpdate(items);
    };


    // TODO MULTI drag https://github.com/atlassian/react-beautiful-dnd/tree/master/stories/src/multi-drag
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <h2>List of Chapters</h2>
            <p className="text-muted">Here you see the list of fetched chapters. You can rearrange chapters via drag
                and drop. If you click on a chapter you will see a small preview of the chapter.</p>
            <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <ListContainer
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {/*<Accordion>*/}
                        {props.chapters.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                    <ItemContainer key={item.id}
                                                   ref={provided.innerRef}
                                                   {...provided.draggableProps}
                                                   {...provided.dragHandleProps}>
                                        <ChapterListItem chapter={item}
                                                         index={index}
                                                         onDelete={onDeleteChapter}
                                        />
                                    </ItemContainer>)}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        {/*</Accordion>*/}
                    </ListContainer>
                )}
            </Droppable>
        </DragDropContext>
    );
}
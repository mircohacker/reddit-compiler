import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import {ChapterList} from "./ChapterList";
import {Chapter} from "../models/chapter";

jest.mock("../adapters/BackendAdapter");

function setupComponent(chapters: Chapter[] = [], onChapterListUpdate1: jest.Mock | any = undefined) {
    jest.clearAllMocks();

    return render(<ChapterList chapters={chapters}
                               onChapterListUpdate={onChapterListUpdate1}/>);

}

describe("anchorurl", () => {

    it("should render", () => {
        setupComponent()
    });

    it("should display the chapter titles", async () => {
        let chapters: Chapter[] = [
            {id: "1", title: "Chapter1!", snippet: "lorem ipsum"},
            {id: "2", title: "Chapter2!"},
            {id: "3", title: "Chapter3!"},
        ]
        const onChapterListUpdate = jest.fn()
        const {findByText, queryAllByText} = setupComponent(chapters, onChapterListUpdate);

        let itemSnippet = await queryAllByText(/lorem ipsum/)
        expect(itemSnippet.length).toBe(0)

        const items = await queryAllByText(/Chapter[0-9]!/)
        expect(items.length).toBe(3)
    });


    it("should delete the chapter from the list when delete is clicked", async () => {
        let chapters: Chapter[] = [
            {id: "1", title: "Chapter1!", snippet: "lorem ipsum"},
            {id: "2", title: "Chapter2!"},
            {id: "3", title: "Chapter3!"},
        ]
        const onChapterListUpdate = jest.fn()
        const {findByText, queryAllByText} = setupComponent(chapters, onChapterListUpdate);

        const itemWithText = await findByText(/Chapter1!/)
        const deleteButton = itemWithText.getElementsByTagName('button')

        expect(deleteButton.length).toBe(1)

        fireEvent.click(deleteButton[0], {});

        expect(onChapterListUpdate).toBeCalledTimes(1)
        expect(onChapterListUpdate).toBeCalledWith([{id: "2", title: "Chapter2!"},
            {id: "3", title: "Chapter3!"}])
    });

    it("should show the snippet when title is clicked", async () => {
        let chapters: Chapter[] = [
            {id: "1", title: "Chapter1!", snippet: "lorem ipsum"},
            {id: "2", title: "Chapter2!"},
            {id: "3", title: "Chapter3!"},
        ]
        const onChapterListUpdate = jest.fn()
        const {findByText, queryAllByText} = setupComponent(chapters, onChapterListUpdate);

        let itemSnippet = await queryAllByText(/lorem ipsum/)
        expect(itemSnippet.length).toBe(0)

        const itemWithText = await findByText(/Chapter1!/)
        fireEvent.click(itemWithText, {});

        itemSnippet = await queryAllByText(/lorem ipsum/)

        expect(itemSnippet.length).toBe(1)
    });
});

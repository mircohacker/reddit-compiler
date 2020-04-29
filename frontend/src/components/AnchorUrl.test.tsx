import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import {AnchorUrl} from "./AnchorUrl";
import '@testing-library/jest-dom/extend-expect'
import * as backendAdapter from "../adapters/BackendAdapter";

// Mock out all top level functions, such as get, put, delete and post:
jest.mock("../adapters/BackendAdapter");

function setupComponent() {
    jest.clearAllMocks();
    const onErrorMock = jest.fn();
    const onSubmitMock = jest.fn();
    const {getByText, getByLabelText, queryByText} = render(<AnchorUrl onError={onErrorMock} onSubmit={onSubmitMock}/>);
    return {onErrorMock, onSubmitMock, getByText, getByLabelText, queryByText};
}

describe("anchorurl", () => {

    it("should render", () => {
        setupComponent()
    });

    it("should accept inputs to chapter input field", () => {
        const {getByLabelText} = setupComponent();
        const linkElement = getByLabelText("URL of one chapter");

        fireEvent.change(linkElement, {target: {value: 'http://foo.bar'}});

        expect(linkElement).toBeInTheDocument();
        // @ts-ignore
        expect(linkElement.value).toEqual('http://foo.bar');
    });

    it("should accept inputs to search term length input", () => {
        const {getByLabelText} = setupComponent();
        const linkElement = getByLabelText("Search term length");

        let value = 42;
        fireEvent.change(linkElement, {target: {value: value}});

        expect(linkElement).toBeInTheDocument();
        // @ts-ignore
        expect(linkElement.value + "").toEqual(value + "");
    });

    it("should send submit and display results", async () => {
        const {onErrorMock, onSubmitMock, getByText, getByLabelText} = setupComponent();

        const button = getByText(/Add Chapters/i);

        const linkElement = getByLabelText("URL of one chapter");
        fireEvent.change(linkElement, {target: {value: 'http://foo.bar'}});
        expect(linkElement).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();

        // @ts-ignore
        const getChMock = backendAdapter.getChaptersFromBackend.mockImplementation(() => {
            return Promise.resolve({
                data: {
                    author: "my_author",
                    search_term: "my_searchTerm",
                    chapters: [],
                }
            })
        });

        fireEvent.click(button);
        //directly after the click the button has to be disabled to restrict double clicks
        expect(button).toBeDisabled();

        // await for the promise to be resolved. async stuff...
        await waitFor(() => {
            expect(getChMock).toHaveBeenCalledTimes(1);
            expect(onErrorMock).toHaveBeenCalledTimes(0);
            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith([]);
            const author = getByText('my_author');
            expect(author).toBeInTheDocument();

            // the button have to be reenabled after request
            expect(button).toBeEnabled();
        });
    });

    it("should send submit and fail gracefully", async () => {
        const {onErrorMock, onSubmitMock, getByText, getByLabelText, queryByText} = setupComponent();

        const button = getByText(/Add Chapters/i);

        const linkElement = getByLabelText("URL of one chapter");
        fireEvent.change(linkElement, {target: {value: 'http://foo.bar'}});
        expect(linkElement).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();

        let errorResponse = {foo: "bar"};
        // @ts-ignore
        const getChMock = backendAdapter.getChaptersFromBackend.mockImplementation(() => {
            return Promise.reject(errorResponse);
        });

        fireEvent.click(button);
        //directly after the click the button has to be disabled to restrict double clicks
        expect(button).toBeDisabled();

        // await for the promise to be resolved. async stuff...
        await waitFor(() => {
            expect(getChMock).toHaveBeenCalledTimes(1);
            expect(onErrorMock).toHaveBeenCalledTimes(1);
            expect(onErrorMock).toHaveBeenCalledWith(errorResponse);
            expect(onSubmitMock).toHaveBeenCalledTimes(0);
            const author = queryByText('my_author');
            expect(author).toBeNull();

            // the button have to be reenabled after request
            expect(button).toBeEnabled();
        });
    });
});

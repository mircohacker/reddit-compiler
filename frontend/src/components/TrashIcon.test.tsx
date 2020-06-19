import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import TrashIcon from "./TrashIcon";

describe("TrashIcon", () => {

    it("should render", () => {
        const {container} = render(<TrashIcon/>);
        let svgElement = container.getElementsByTagName("svg")

        expect(svgElement).toBeDefined()
        expect(svgElement.length).toBe(1)
        expect(svgElement.item(0)).toBeInTheDocument()
    });
})
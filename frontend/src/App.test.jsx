"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var App_1 = require("./App");
test('renders learn react link', function () {
    var getByText = react_2.render(<App_1.default />).getByText;
    var linkElement = getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});

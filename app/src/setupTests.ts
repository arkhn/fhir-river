// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
// jsdom doesn't support fetch
// https://github.com/jsdom/jsdom/issues/1724
import { default as nodeFetch, Request } from "node-fetch";
//@ts-ignore
global.fetch = nodeFetch;
//@ts-ignore
global.Request = Request;

jest.setTimeout(42000);

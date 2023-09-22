"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*-
 * #%L
 * test
 * %%
 * Copyright (C) 2023 TODO: Enter Organization name
 * %%
 * TODO: Define header text
 * #L%
 */
const sample_1 = require("./sample");
describe("Tests", () => {
    it("should sum two numbers", () => {
        expect(new sample_1.SampleClass().sum(1, 2)).toBe(3);
    });
});

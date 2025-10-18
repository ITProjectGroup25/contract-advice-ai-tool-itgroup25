import parseSubmissionString from "./parseFormData";

describe("parseSubmissionString", () => {
  it("should parse the submission string correctly", () => {
    const testString =
      '{"name":"brady","email":"bradysuryasie@gmail.com","grants-team":["international"],"stage-of-query":"post-award","query-type":"simple","simple-request-explanation":"FIHAWFA","simple-grants-scheme":["nhmrc","arc"],"simple-mri-involvement":"yes","simple-type-of-query":["support-negotiations","contractual"],"simple-urgency":"no","simple-clause-type":["project-ip","liability"],"simple-guide-check":"yes"}';

    const result = parseSubmissionString({ uncleanFormData: testString });

    expect(result).toEqual({
      name: "brady",
      email: "bradysuryasie@gmail.com",
      "grants-team": ["international"],
      "stage-of-query": "post-award",
      "query-type": "simple",
      "simple-request-explanation": "FIHAWFA",
      "simple-grants-scheme": ["nhmrc", "arc"],
      "simple-mri-involvement": "yes",
      "simple-type-of-query": ["support-negotiations", "contractual"],
      "simple-urgency": "no",
      "simple-clause-type": ["project-ip", "liability"],
      "simple-guide-check": "yes",
    });
  });
});

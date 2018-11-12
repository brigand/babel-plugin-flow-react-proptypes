const babel = require('babel-core');
const content = `
// @flow
import type { AdPartner, Job, JobAlert, SeoText } from './JLCommon';
import type { DirectApplyDraft, DirectApplyFile } from './reducer/DirectApply';
import type { SearchQuery } from './joblift-query-parser';

// eslint-disable-next-line
export type { SearchQuery };

export type jpopunderPostResult = {
    items: Job[],
    adPartners: AdPartner[],
};

export type searchPostResult = {
    items: Job[],
    seoText?: SeoText[],
    query: SearchQuery,
    index: boolean,
    total: number,
    pages: number,
    resultId: string,
    facets?: { [key: string]: { key: number, amount: number, translation: string }[] },
};

// api/jobalert/me/
export type jobalertMeGetResult = {
    description: string,
    jobalerts: JobAlert[],
};

// api/joblocation-reverse-lookup
export type joblocationReverseLookupGetResult = {
    display_name: string,
};

// api/joblocation-suggestion
export type joblocationSuggestionGetResult = {
    suggestions: Array<{ value: string }>,
};

// api/jobsearch-suggestion
export type jobsearchSuggestionGetResult = {
    suggestions: Array<{ value: string, numJobs?: number }>,
};

// api/jobsearch-suggestion/popular
export type freqSearchSuggestionGetResult = {
    suggestions: Array<{ value: string, numJobs: number }>,
};

// api/charts
export type statisticalDataGetResult = {
    keys: string[],
    data: Object,
};

// api/joboffer
export type jobofferGetResult = Job;

// api/popunder
export type popunderPostResponse = {
    showPopunder: boolean,
    url: string,
    itemCount: number,
    partner: string,
    customer: string,
    customerId: number,
    suppressTransactionId?: boolean,
    ch: string,
};

// auth/json/login/local
export type loginPostResult = {
    displayName?: string,
    firstName: string,
    initialCreated: boolean,
    isAnonymous?: boolean,
    lastName: string,
    localAccounts: Array<{
        email: string,
    }>,
    socialAccounts: Object[],
    uniqueEmails: string[],
    uuid: string,
};

// api/direct-apply/offer/<jobofferid>/draft
export type directApplyDraftGet = DirectApplyDraft;

// api/direct-apply/files/recent
export type directApplyRecentFilesGet = DirectApplyFile[];
`;

it('real4', () => {
  const res = babel.transform(content, {
    babelrc: false,
    presets: ['env', 'stage-1', 'react'],
    plugins: ['syntax-flow', require('../')],
  }).code;
  expect(res).toMatchSnapshot();
});

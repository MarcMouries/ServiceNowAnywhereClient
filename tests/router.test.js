import { beforeEach, describe, it, expect } from 'bun:test';
import Router from '../src/components/router';

describe('Router.matchRoute', () => {
    let router;
    let listHandler, recordHandler, defaultHandler;

    beforeEach(() => {
        // Define the handler functions
        listHandler = () => {};
        recordHandler = () => {};
        defaultHandler = () => {};

        // Initialize the router with routes
        router = new Router({
            '/list/:table': listHandler,
            '/record/:table/:sysId': recordHandler,
            '/': defaultHandler  // Default route handler
        });
    });

    it('should match /list/:table route and return the correct handler function', () => {
        const match = router.matchRoute('/list/testTable');
        expect(match).toBeTruthy();
        expect(match.route).toBe(listHandler);  // Compare the handler function directly
        expect(match.params).toEqual({ table: 'testTable' });
    });

    it('should match /record/:table/:sysId route and return the correct handler function', () => {
        const match = router.matchRoute('/record/testTable/12345');
        expect(match).toBeTruthy();
        expect(match.route).toBe(recordHandler);  // Compare the handler function directly
        expect(match.params).toEqual({ table: 'testTable', sysId: '12345' });
    });

    it('should return null for unmatched routes', () => {
        const match = router.matchRoute('/unmatched/route');
        expect(match).toBeNull();
    });

    it('should handle routes with similar patterns correctly and return the correct handlers', () => {
        const matchList = router.matchRoute('/list/testTable');
        const matchRecord = router.matchRoute('/record/testTable/12345');

        expect(matchList).toBeTruthy();
        expect(matchRecord).toBeTruthy();

        expect(matchList.route).toBe(listHandler);  // Compare the handler function directly
        expect(matchRecord.route).toBe(recordHandler);  // Compare the handler function directly

        expect(matchList.params).toEqual({ table: 'testTable' });
        expect(matchRecord.params).toEqual({ table: 'testTable', sysId: '12345' });
    });

    it('should not match routes with missing parameters', () => {
        const match = router.matchRoute('/record/testTable');
        expect(match).toBeNull();
    });
});

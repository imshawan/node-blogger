/**
 * @interface ITestConfig
 * @description Designed to facilitate precise configuration within the Mocha testing suite. 
 * 
 * This interface serves as a pivotal tool in tailoring testing scenarios and enhancing the control and reliability of the testing process within the Mocha framework.
 */
export interface ITestConfig {

    /** 
     * Timeout threshold value for mocha testing suite
     * This value dictates the maximum duration a test executed within the Mocha suite is permitted to run. 
     */
    timeout?: Number
}


/**
 * @interface ITestResult
 * @description Provides a comprehensive summary of the outcome of test executions. 
 * 
 * This interface encapsulates essential metrics to provide a clear overview of the testing process.
 */
export interface ITestResult {
    /** Total testcases run. */
    total: Number

    /** Testcases failed. */
    failed: Number
    
    /** Testcases passed. */
    passed: Number

    /** Overall status (passed/failed) based on the testcases run. */
    overallStatus: string
}
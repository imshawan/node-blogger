/*
 * Copyright (C) 2023 Shawan Mandal <hello@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
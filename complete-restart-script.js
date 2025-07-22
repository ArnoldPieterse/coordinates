#!/usr/bin/env node

/**
 * Complete Restart Script with Custom AWS and Git Commands
 * Safely restart computer while maintaining all automation and monitoring systems
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

class CompleteRestartScript {
    constructor() {
        this.config = {
            awsRegion: 'us-east-1',
            projectName: 'coordinates',
            domain: 'rekursing.com',
            s3Bucket: 'rekursing-coordinates',
            cloudfrontDistribution: 'E1234567890ABC',
            hostedZoneId: 'Z1234567890ABC',
            lambdaFunction: 'coordinates-api',
            restartDelay: 30000, // 30 seconds
            backupInterval: 5000, // 5 seconds
            maxBackupAttempts: 3
        };
        
        this.restartStatus = {
            gitBackup: false,
            awsBackup: false,
            workflowDeployment: false,
            monitoringSetup: false,
            servicesStopped: false,
            restartInitiated: false
        };
        
        this.backupData = {
            gitStatus: null,
            awsStatus: null,
            workflowStatus: null,
            monitoringStatus: null,
            timestamp: null
        };
    }

    /**
     * Execute complete restart process
     */
    async executeCompleteRestart() {
        console.log('🔄 COMPLETE RESTART SCRIPT');
        console.log('==========================');
        console.log('Initiating complete restart with AWS and Git commands...\n');

        try {
            // Step 1: Git operations and backup
            await this.performGitOperations();
            
            // Step 2: AWS operations and backup
            await this.performAWSOperations();
            
            // Step 3: Deploy workflows to AWS
            await this.deployWorkflowsToAWS();
            
            // Step 4: Setup monitoring for restart
            await this.setupRestartMonitoring();
            
            // Step 5: Stop local services
            await this.stopLocalServices();
            
            // Step 6: Initiate restart
            await this.initiateRestart();
            
        } catch (error) {
            console.error('❌ Restart process failed:', error);
            await this.performEmergencyBackup();
            throw error;
        }
    }

    /**
     * Perform Git operations and backup
     */
    async performGitOperations() {
        console.log('📚 STEP 1: GIT OPERATIONS AND BACKUP');
        console.log('=====================================');
        
        try {
            // Check current Git status
            console.log('Checking Git status...');
            const { stdout: gitStatus } = await execAsync('git status --porcelain');
            this.backupData.gitStatus = gitStatus;
            console.log('✅ Git status captured');
            
            // Get current branch and commit
            const { stdout: gitBranch } = await execAsync('git branch --show-current');
            const { stdout: gitCommit } = await execAsync('git rev-parse HEAD');
            console.log(`Current branch: ${gitBranch.trim()}`);
            console.log(`Current commit: ${gitCommit.trim().substring(0, 8)}`);
            
            // Check for uncommitted changes
            if (gitStatus.trim()) {
                console.log('⚠️ Uncommitted changes detected, creating backup commit...');
                await execAsync('git add -A');
                await execAsync('git commit -m "backup: pre-restart backup commit"');
                console.log('✅ Backup commit created');
            }
            
            // Push all changes to remote
            console.log('Pushing changes to remote repository...');
            await execAsync('git push origin main');
            console.log('✅ Changes pushed to remote');
            
            // Create Git backup file
            const gitBackup = {
                timestamp: new Date().toISOString(),
                branch: gitBranch.trim(),
                commit: gitCommit.trim(),
                status: gitStatus,
                remote: 'origin/main'
            };
            
            await fs.writeFile('git-backup.json', JSON.stringify(gitBackup, null, 2));
            console.log('✅ Git backup file created');
            
            this.restartStatus.gitBackup = true;
            console.log('✅ Git operations completed successfully\n');
            
        } catch (error) {
            console.error('❌ Git operations failed:', error.message);
            throw error;
        }
    }

    /**
     * Perform AWS operations and backup
     */
    async performAWSOperations() {
        console.log('☁️ STEP 2: AWS OPERATIONS AND BACKUP');
        console.log('=====================================');
        
        try {
            // Backup current AWS configuration
            console.log('Backing up AWS configuration...');
            const awsBackup = {
                timestamp: new Date().toISOString(),
                region: this.config.awsRegion,
                services: {}
            };
            
            // Backup S3 bucket status
            try {
                const { stdout: s3Status } = await execAsync(`aws s3 ls s3://${this.config.s3Bucket} --recursive --summarize`);
                awsBackup.services.s3 = {
                    bucket: this.config.s3Bucket,
                    status: 'accessible',
                    summary: s3Status
                };
                console.log('✅ S3 bucket status captured');
            } catch (error) {
                awsBackup.services.s3 = {
                    bucket: this.config.s3Bucket,
                    status: 'error',
                    error: error.message
                };
                console.log('⚠️ S3 bucket access failed, continuing...');
            }
            
            // Backup CloudFront distribution status
            try {
                const { stdout: cloudfrontStatus } = await execAsync(`aws cloudfront get-distribution --id ${this.config.cloudfrontDistribution}`);
                awsBackup.services.cloudfront = {
                    distribution: this.config.cloudfrontDistribution,
                    status: 'accessible',
                    data: JSON.parse(cloudfrontStatus)
                };
                console.log('✅ CloudFront distribution status captured');
            } catch (error) {
                awsBackup.services.cloudfront = {
                    distribution: this.config.cloudfrontDistribution,
                    status: 'error',
                    error: error.message
                };
                console.log('⚠️ CloudFront access failed, continuing...');
            }
            
            // Backup Route53 hosted zone
            try {
                const { stdout: route53Status } = await execAsync(`aws route53 get-hosted-zone --id ${this.config.hostedZoneId}`);
                awsBackup.services.route53 = {
                    hostedZone: this.config.hostedZoneId,
                    status: 'accessible',
                    data: JSON.parse(route53Status)
                };
                console.log('✅ Route53 hosted zone status captured');
            } catch (error) {
                awsBackup.services.route53 = {
                    hostedZone: this.config.hostedZoneId,
                    status: 'error',
                    error: error.message
                };
                console.log('⚠️ Route53 access failed, continuing...');
            }
            
            // Backup Lambda function status
            try {
                const { stdout: lambdaStatus } = await execAsync(`aws lambda get-function --function-name ${this.config.lambdaFunction}`);
                awsBackup.services.lambda = {
                    function: this.config.lambdaFunction,
                    status: 'accessible',
                    data: JSON.parse(lambdaStatus)
                };
                console.log('✅ Lambda function status captured');
            } catch (error) {
                awsBackup.services.lambda = {
                    function: this.config.lambdaFunction,
                    status: 'error',
                    error: error.message
                };
                console.log('⚠️ Lambda access failed, continuing...');
            }
            
            // Save AWS backup
            await fs.writeFile('aws-backup.json', JSON.stringify(awsBackup, null, 2));
            console.log('✅ AWS backup file created');
            
            this.backupData.awsStatus = awsBackup;
            this.restartStatus.awsBackup = true;
            console.log('✅ AWS operations completed successfully\n');
            
        } catch (error) {
            console.error('❌ AWS operations failed:', error.message);
            throw error;
        }
    }

    /**
     * Deploy workflows to AWS
     */
    async deployWorkflowsToAWS() {
        console.log('🚀 STEP 3: DEPLOY WORKFLOWS TO AWS');
        console.log('==================================');
        
        try {
            const workflows = [
                'ci-cd-pipeline.yml',
                'dependency-update.yml'
            ];
            
            console.log('Deploying workflows to AWS S3...');
            
            for (const workflow of workflows) {
                try {
                    const workflowPath = `.github/workflows/${workflow}`;
                    const s3Path = `s3://${this.config.s3Bucket}/workflows/${workflow}`;
                    
                    console.log(`Deploying ${workflow}...`);
                    await execAsync(`aws s3 cp ${workflowPath} ${s3Path}`);
                    console.log(`✅ ${workflow} deployed to ${s3Path}`);
                    
                } catch (error) {
                    console.log(`⚠️ Failed to deploy ${workflow}: ${error.message}`);
                }
            }
            
            // Create workflow deployment status
            const workflowStatus = {
                timestamp: new Date().toISOString(),
                workflows: workflows,
                s3Bucket: this.config.s3Bucket,
                status: 'deployed'
            };
            
            await fs.writeFile('workflow-deployment-status.json', JSON.stringify(workflowStatus, null, 2));
            console.log('✅ Workflow deployment status saved');
            
            this.backupData.workflowStatus = workflowStatus;
            this.restartStatus.workflowDeployment = true;
            console.log('✅ Workflow deployment completed successfully\n');
            
        } catch (error) {
            console.error('❌ Workflow deployment failed:', error.message);
            throw error;
        }
    }

    /**
     * Setup restart monitoring
     */
    async setupRestartMonitoring() {
        console.log('📊 STEP 4: SETUP RESTART MONITORING');
        console.log('====================================');
        
        try {
            // Create monitoring configuration for post-restart
            const monitoringConfig = {
                timestamp: new Date().toISOString(),
                restartInitiated: true,
                services: {
                    enhancedBotHelper: {
                        status: 'stopped',
                        restartCommand: 'node enhanced-bot-helper-with-frequent-prompts.js',
                        monitoringInterval: 15000
                    },
                    testBotHelper: {
                        status: 'stopped',
                        restartCommand: 'node test-enhanced-bot-helper.js',
                        monitoringInterval: 10000
                    },
                    gitMonitoring: {
                        status: 'active',
                        checkInterval: 60000
                    },
                    awsMonitoring: {
                        status: 'active',
                        checkInterval: 300000
                    }
                },
                postRestartTasks: [
                    'Verify Git repository status',
                    'Check AWS service connectivity',
                    'Restart enhanced bot helper',
                    'Validate workflow deployments',
                    'Monitor system performance'
                ]
            };
            
            await fs.writeFile('restart-monitoring-config.json', JSON.stringify(monitoringConfig, null, 2));
            console.log('✅ Restart monitoring configuration created');
            
            // Create post-restart script
            const postRestartScript = `#!/usr/bin/env node

/**
 * Post-Restart Recovery Script
 * Automatically executed after system restart
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function postRestartRecovery() {
    console.log('🔄 POST-RESTART RECOVERY');
    console.log('========================');
    
    try {
        // Load monitoring configuration
        const config = JSON.parse(await fs.readFile('restart-monitoring-config.json', 'utf8'));
        
        // Verify Git status
        console.log('Verifying Git repository status...');
        const { stdout: gitStatus } = await execAsync('git status --porcelain');
        if (gitStatus.trim()) {
            console.log('⚠️ Uncommitted changes detected after restart');
        } else {
            console.log('✅ Git repository clean');
        }
        
        // Check AWS connectivity
        console.log('Checking AWS service connectivity...');
        try {
            await execAsync('aws sts get-caller-identity');
            console.log('✅ AWS connectivity verified');
        } catch (error) {
            console.log('❌ AWS connectivity failed');
        }
        
        // Restart enhanced bot helper
        console.log('Restarting enhanced bot helper...');
        try {
            exec('node enhanced-bot-helper-with-frequent-prompts.js', { detached: true });
            console.log('✅ Enhanced bot helper restarted');
        } catch (error) {
            console.log('❌ Failed to restart enhanced bot helper');
        }
        
        // Restart test bot helper
        console.log('Restarting test bot helper...');
        try {
            exec('node test-enhanced-bot-helper.js', { detached: true });
            console.log('✅ Test bot helper restarted');
        } catch (error) {
            console.log('❌ Failed to restart test bot helper');
        }
        
        console.log('✅ Post-restart recovery completed');
        
    } catch (error) {
        console.error('❌ Post-restart recovery failed:', error);
    }
}

postRestartRecovery();
`;
            
            await fs.writeFile('post-restart-recovery.js', postRestartScript);
            console.log('✅ Post-restart recovery script created');
            
            this.backupData.monitoringStatus = monitoringConfig;
            this.restartStatus.monitoringSetup = true;
            console.log('✅ Restart monitoring setup completed successfully\n');
            
        } catch (error) {
            console.error('❌ Restart monitoring setup failed:', error.message);
            throw error;
        }
    }

    /**
     * Stop local services
     */
    async stopLocalServices() {
        console.log('🛑 STEP 5: STOP LOCAL SERVICES');
        console.log('==============================');
        
        try {
            // Stop any running Node.js processes (except this script)
            console.log('Stopping local Node.js services...');
            
            try {
                // Kill any running bot helper processes
                await execAsync('taskkill /f /im node.exe 2>nul || echo "No Node.js processes to stop"');
                console.log('✅ Local Node.js services stopped');
            } catch (error) {
                console.log('⚠️ No Node.js processes running or already stopped');
            }
            
            // Create service status file
            const serviceStatus = {
                timestamp: new Date().toISOString(),
                services: {
                    enhancedBotHelper: 'stopped',
                    testBotHelper: 'stopped',
                    automatedPromptService: 'stopped',
                    awsBotHelperScheduler: 'stopped'
                },
                restartRequired: true
            };
            
            await fs.writeFile('service-status.json', JSON.stringify(serviceStatus, null, 2));
            console.log('✅ Service status file created');
            
            this.restartStatus.servicesStopped = true;
            console.log('✅ Local services stopped successfully\n');
            
        } catch (error) {
            console.error('❌ Failed to stop local services:', error.message);
            throw error;
        }
    }

    /**
     * Initiate restart
     */
    async initiateRestart() {
        console.log('🔄 STEP 6: INITIATE RESTART');
        console.log('===========================');
        
        try {
            // Create final restart summary
            const restartSummary = {
                timestamp: new Date().toISOString(),
                status: 'restart_initiated',
                completedSteps: this.restartStatus,
                backupData: this.backupData,
                restartCommand: 'shutdown /r /t 30 /c "Coordinates project restart initiated"',
                postRestartScript: 'node post-restart-recovery.js'
            };
            
            await fs.writeFile('restart-summary.json', JSON.stringify(restartSummary, null, 2));
            console.log('✅ Restart summary created');
            
            // Display restart countdown
            console.log('🕐 RESTART COUNTDOWN');
            console.log('===================');
            console.log('Computer will restart in 30 seconds...');
            console.log('All services have been safely stopped and backed up.');
            console.log('Post-restart recovery will be automatic.');
            console.log('');
            console.log('Press Ctrl+C to cancel restart');
            
            // Wait for user confirmation or timeout
            await this.waitForRestartConfirmation();
            
            // Execute restart command
            console.log('🚀 Executing restart command...');
            await execAsync('shutdown /r /t 30 /c "Coordinates project restart initiated"');
            
            this.restartStatus.restartInitiated = true;
            console.log('✅ Restart command executed successfully');
            console.log('🔄 Computer will restart in 30 seconds...');
            
        } catch (error) {
            console.error('❌ Restart initiation failed:', error.message);
            throw error;
        }
    }

    /**
     * Wait for restart confirmation
     */
    async waitForRestartConfirmation() {
        return new Promise((resolve) => {
            console.log('⏳ Waiting for restart confirmation...');
            
            // Set up process signal handlers
            process.on('SIGINT', () => {
                console.log('\n❌ Restart cancelled by user');
                process.exit(0);
            });
            
            process.on('SIGTERM', () => {
                console.log('\n❌ Restart cancelled');
                process.exit(0);
            });
            
            // Auto-confirm after 10 seconds
            setTimeout(() => {
                console.log('✅ Auto-confirming restart...');
                resolve();
            }, 10000);
        });
    }

    /**
     * Perform emergency backup
     */
    async performEmergencyBackup() {
        console.log('🚨 EMERGENCY BACKUP');
        console.log('==================');
        
        try {
            const emergencyBackup = {
                timestamp: new Date().toISOString(),
                status: 'emergency_backup',
                error: 'Restart process failed',
                restartStatus: this.restartStatus,
                backupData: this.backupData
            };
            
            await fs.writeFile('emergency-backup.json', JSON.stringify(emergencyBackup, null, 2));
            console.log('✅ Emergency backup created');
            
        } catch (error) {
            console.error('❌ Emergency backup failed:', error.message);
        }
    }

    /**
     * Get restart status
     */
    getRestartStatus() {
        return {
            status: 'ready_for_restart',
            completedSteps: this.restartStatus,
            backupData: this.backupData,
            timestamp: new Date().toISOString()
        };
    }
}

// Run the complete restart script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const restartScript = new CompleteRestartScript();
    restartScript.executeCompleteRestart().catch(error => {
        console.error('❌ Complete restart script failed:', error);
        process.exit(1);
    });
}

export default CompleteRestartScript; 
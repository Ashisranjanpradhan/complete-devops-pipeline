package com.opsmind.deployment;

public enum DeploymentStatus {
    QUEUED,
    BUILDING,
    TESTING,
    DEPLOYING,
    SUCCESS,
    FAILED,
    ROLLED_BACK
}

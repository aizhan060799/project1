# **ProShop App CI/CD Deployment**

  
## Overview


The ProShop application is an e-commerce platform that we are deploying via a CI/CD pipeline using GitHub Actions. The goal of this project is to configure the application to be built and deployed to a Kubernetes cluster with GitHub Actions, using Docker for building the images and AWS ECR as the image registry.**

## Architecture

The architecture of the ProShop CI/CD deployment includes the following components:

1. **CI/CD Pipeline**:
   - Implemented using GitHub Actions to automate build and deployment processes.
   - Uses Docker for image building and tagging.
   - Pushes Docker images to AWS ECR.

2. **Kubernetes Cluster**:
   - Deployed using Helm charts to manage frontend and backend applications.
   - Ingress-nginx controller is used for routing and TLS termination.
   - AWS Secrets Manager and Kubernetes SecretProviderClass are used for managing sensitive information.

3. **Environment Management**:
   - Configured to support development, staging, and production environments.
   - Separate Helm values files (`dev-values.yaml`, `staging-values.yaml`, `prod-values.yaml`) are used to manage different environment configurations.

4. **Security**:
   - TLS certificates obtained via Let’s Encrypt provide secure connections.
   - AWS Secrets Manager manages sensitive credentials, ensuring secure integration with Kubernetes.


## Project Goals

-  **CI/CD Setup**: Automate the build and deployment of the ProShop app using GitHub Actions.

-  **Kubernetes Deployment**: Use Helm charts to manage the deployment of both frontend and backend applications into a Kubernetes cluster.

-  **Environment Management**: Configure the application for multiple environments (development, staging, and production), with a focus on the development environment.

-  **Security**: Use AWS Secrets Manager to manage sensitive credentials and integrate them securely with the Kubernetes cluster.


## Features


-  **Docker Image Build**: The application is containerized and built using Docker.

-  **AWS ECR**: Docker images are pushed to AWS Elastic Container Registry (ECR) with repository immutability enabled.

-  **Helm for Deployment**: Both frontend and backend applications are deployed using Helm charts. Separate `dev-values.yaml`, `staging-values.yaml`, and `prod-values.yaml` are created for each environment.

-  **GitHub Actions CI/CD**: Automates the build and deployment process with environment-specific variables.

-  **TLS Configuration**: The application is secured with TLS certificates obtained via Let's Encrypt.

-  **AWS Secrets Manager**: Sensitive information such as database credentials is securely managed via AWS Secrets Manager and integrated with Kubernetes using the SecretProviderClass.

  
## Prerequisites
  

-  **AWS Account**: Access to AWS resources such as ECR, IAM, and Secrets Manager.

-  **Kubernetes Cluster**: A running Kubernetes cluster with an Ingress-nginx controller configured.

-  **GitHub Repository**: Access to a GitHub repository for the ProShop application.

-  **Helm**: Installed locally to manage Kubernetes resources.

## GitHub Actions CI/CD Pipeline

The CI/CD pipeline automates the following:
Building Docker images for both the frontend and backend applications. Pushing the images to AWS ECR with immutability enabled. Deploying the application using Helm into a Kubernetes cluster.
- Using Git SHA for versioning and tagging Docker images.

- IAM Role: A role named GitHubActionsCICDrole-proshop is used to build and push images to ECR. Ensure the trust policy is configured to allow access from your GitHub repository using OpenID Connect.

- Kubernetes Access: Ensure the IAM role has permissions to create Kubernetes objects (e.g., deployments, pods, etc.) and eks permissions to allow deployment into the cluster. Manually update the `aws-auth` ConfigMap in AWS EKS cluster to map the IAM role to a Kubernetes user or group, enabling the necessary permissions for deployments.

- Environment Variables: Store the IAM_ROLE ARN in GitHub repository settings for use in the pipeline.

**Helm Chart Deployment**
Helm charts are used to deploy both the frontend and backend applications. Values files for each environment are configured, although only the development environment (dev-values.yaml) will be used for this project.

- dev-values.yaml: Used for the development environment.

- staging-values.yaml: Configured for future use in staging.

- prod-values.yaml: Configured for future use in production.

**Database Connectivity**
AWS Secrets Manager is used to store and manage database credentials securely. These credentials are integrated with Kubernetes Secrets using the SecretProviderClass from AWS Secrets Manager

**TLS Security**
Obtain a TLS certificate from Let's Encrypt or use an existing Wildcard Certificate. Store the certificate in a Kubernetes secret. Reference the TLS certificate in Ingress rules to provide TLS termination at the ingress controller.


## Issues Faced

1. **Docker Image Tagging Errors**:
   - **Issue**: Errors when tagging Docker images with Git SHA.
   - **Solution**: Adjusted GitHub Actions YAML for proper Git SHA extraction and tagging.

2. **ECR Push Permissions**:
   - **Issue**: Insufficient permissions for pushing images to ECR.
   - **Solution**: Updated IAM role policies to include necessary ECR permissions.

3. **Helm Chart Configuration**:
   - **Issue**: Initial misconfigurations in Helm values files.
   - **Solution**: Corrected values files and tested different environments.

4. **Ingress TLS Setup**:
   - **Issue**: TLS certificate misapplication due to incorrect Ingress rules.
   - **Solution**: Updated Ingress rules to properly reference the TLS secret.

5. **SecretProviderClass Misconfiguration**:
   - **Issue**: The SecretProviderClass was incorrectly configured, causing secrets to fail to mount in pods.
   - **Solution**: Corrected the SecretProviderClass definition and ensured that the correct object names and namespaces were specified.

6. **Permissions for AWS Secrets Manager**:
   - **Issue**: Initial permission errors occurred when attempting to fetch secrets from AWS Secrets Manager.
   - **Solution**: Updated the IAM role policies to include `secretsmanager:GetSecretValue`, allowing Kubernetes to access secrets securely.

7. **Database Connectivity Issue**:
   - **Issue**: Backend pods failed to connect to the database, causing service downtime.
   - **Solution**: Checked environment variables, verified secrets, tested network connectivity, and ensured the IAM role had permissions for AWS Secrets Manager.

8. **Docker Image Build for Linux/AMD64 Compatibility**:
   - **Issue**: Docker images built on ARM64 (e.g., Apple M1/M2) were not compatible with Linux/AMD64 in production, causing runtime errors.
   - **Solution**: Used Docker's `--platform=linux/amd64` flag during the build process:
     ```bash
     docker build --platform=linux/amd64 -t <image-name> .
     ```

## Troubleshooting Backend Database Connectivity

If the backend cannot connect to the database:

1. **Check Environment Variables**: Use `kubectl exec <backend-pod-name> -- env` to verify correct variables.
2. **Verify Secrets**: Use `kubectl describe pod <backend-pod-name>` to check if secrets are mounted.
3. **Test Network Connectivity**: Use `curl <db-cluster-endpoint>:27017` to confirm connection.
4. **Inspect Pod Logs**: Use `kubectl logs <backend-pod-name>` to identify connection errors.
5. **Check Database Status**: Confirm the database is running and accessible in AWS.


## Resource Links

Here are some of the resources and courses used during the project:

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [AWS ECR Guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)
- [Helm Documentation](https://helm.sh/docs/)
- [AWS Secrets Manager CSI Driver](https://github.com/kubernetes-sigs/secrets-store-csi-driver)
- [Cert-Manager Documentation](https://cert-manager.io/docs/)
  
## Conclusion

This project provides a fully automated CI/CD pipeline using GitHub Actions, Docker, and Kubernetes. The configuration is future-proofed to allow easy deployment to staging and production environments, even though only the development environment is deployed in this project. The application is secured using TLS and AWS Secrets Manager for sensitive information management.
helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
helm repo update
helm install secrets-store secrets-store-csi-driver/secrets-store-csi-driver --namespace kube-system

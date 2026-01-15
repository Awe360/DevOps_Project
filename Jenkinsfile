pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'awoke/student-management-app'
        DOCKER_TAG   = "${BUILD_NUMBER}"
        REGISTRY_URL = 'https://index.docker.io/v1/'

        // IMPORTANT: point these to where minikube was initialized for the Jenkins service user
        MINIKUBE_HOME = 'C:\\ProgramData\\Jenkins\\.minikube'
        KUBECONFIG    = 'C:\\ProgramData\\Jenkins\\.kube\\config'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                    bat 'echo Logging in to Docker Hub'
                    bat 'echo %DOCKERHUB_PASS% | docker login %REGISTRY_URL% -u %DOCKERHUB_USER% --password-stdin'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %DOCKER_IMAGE%:%DOCKER_TAG% .'
                bat 'docker tag %DOCKER_IMAGE%:%DOCKER_TAG% %DOCKER_IMAGE%:latest'
            }
        }

        stage('Push Docker Image') {
            steps {
                bat 'docker push %DOCKER_IMAGE%:%DOCKER_TAG%'
                bat 'docker push %DOCKER_IMAGE%:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'echo Workspace dir:'
                bat 'cd'
                bat 'dir'

                bat 'echo Checking for YAML files:'
                bat 'if exist deployment.yaml (echo deployment.yaml FOUND) else (exit /b 1)'
                bat 'if exist service.yaml (echo service.yaml FOUND) else (exit /b 1)'

                // Render deployment with the build tag
                bat 'set TAGGED_DEPLOY=%WORKSPACE%\\deployment.rendered.yaml'
                bat 'powershell -NoProfile -Command "(Get-Content deployment.yaml) -replace \'__TAG__\', \'%DOCKER_TAG%\' | Set-Content -Encoding ascii %TAGGED_DEPLOY%"'

                // Ensure minikube context is reachable for the Jenkins service account
                bat 'echo Using MINIKUBE_HOME=%MINIKUBE_HOME%'
                bat 'if not exist "%MINIKUBE_HOME%" (echo ERROR: MINIKUBE_HOME does not exist & exit /b 1)'

                bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" status'
                bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" kubectl -- apply -f %TAGGED_DEPLOY%'
                bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" kubectl -- apply -f service.yaml'
                bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" kubectl -- get pods'
            }
        }
    }

    post {
        always {
            bat 'docker logout %REGISTRY_URL%'
        }
    }
}

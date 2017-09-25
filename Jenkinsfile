pipeline {
  agent any
  stages {
    stage('BeginProcess') {
      steps {
        parallel(
          "Delete old build": {
            sh 'rm -rf dockerbuild/'
          }
        )
      }
    }
    stage('Build') {
      steps {

        sh 'chmod 0755 ./gradlew;./gradlew clean build --refresh-dependencies'

      }
    }
    stage('Docker Build') {
      steps {
        parallel(
          "Build Docker Image": {
            sh 'mkdir dockerbuild/'
            sh 'cp build/libs/*.jar dockerbuild/app.jar'
            sh 'cp Dockerfile dockerbuild/Dockerfile'
            sh 'cp -r static dockerbuild/static'
            sh 'cp -r www dockerbuild/www'
            sh 'cd dockerbuild/'
            sh "docker build -t nucleoteam/m2n:${env.BUILD_NUMBER} ./"
            script {
              echo "[${env.JOB_NAME} #${env.BUILD_NUMBER}] Built Docker image"
            }


          }
        )
      }
    }
    stage('Publish Latest Image') {
      steps {
        sh "docker push nucleoteam/m2n:${env.BUILD_NUMBER}"

      }
    }
  }
}
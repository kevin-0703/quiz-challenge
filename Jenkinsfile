pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo '--- Checking out source code ---'
                checkout scm
                sh 'git log -1 --oneline'
            }
        }
        stage('Deploy') {
            steps {
                echo '--- Deploying application ---'
                timeout(time: 15, unit: 'MINUTES') {
                    sshagent(credentials: ['autoconnect-prod-ssh']) {
                        sh '''
                ssh -o StrictHostKeyChecking=no autoconnect@35.222.250.201 << 'EOF'
                set -e
                cd /home/kevin/quiz-challenge
                echo "Pulling latest code..."
                git fetch origin main
                git reset --hard origin/main
                echo "Stopping old containers..."
                docker compose down
                echo "Building images..."
                docker compose build --no-cache backend frontend
                echo "Starting containers..."
                docker compose up -d
                echo "Waiting for PostgreSQL..."
                until docker compose exec -T db pg_isready -U quiz_user > /dev/null 2>&1; do
                  echo "  ...still waiting for postgres"
                  sleep 2
                done
                echo "Running migrations..."
                docker compose exec -T backend python manage.py migrate --noinput
                echo "Collecting static files..."
                docker compose exec -T backend python manage.py collectstatic --noinput --clear
                echo "=====================pipeline ended==============="
                EOF
                '''
                    }
                }
            }
        }
    }
}

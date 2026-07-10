pipeline {
    agent any

    /*
     * ──────────────────────────────────────────────────────────────────────────
     *  QuizHub — Jenkins CI/CD Pipeline
     *
     *  Deployment model:
     *    - Source:     GitHub (main branch only triggers deploy)
     *    - Registry:   Local Docker images on the host VM (no external registry)
     *    - Runtime:    Docker Compose on the same Google Cloud VM as Jenkins
     *    - Reverse proxy: Nginx (managed outside this pipeline)
     *    - TLS:        Certbot / Let's Encrypt (managed outside this pipeline)
     *
     *  Required Jenkins credentials (configure in Manage Jenkins > Credentials):
     *    - BACKEND_ENV_FILE  : Secret File — the production backend/.env
     *    - FRONTEND_ENV_FILE : Secret File — the production frontend/.env (VITE_API_URL)
     *
     *  Required tools on the Jenkins agent:
     *    - docker (CLI + daemon)
     *    - docker compose (v2 plugin, i.e. `docker compose` not `docker-compose`)
     *    - python3, pip  (for backend tests)
     * ──────────────────────────────────────────────────────────────────────────
     */
    stages {
        // ──────────────────────────────────────────────────────────────────
        // STAGE 1 — SOURCE
        // ──────────────────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '--- Checking out source code ---'
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // STAGE 2 — INJECT SECRETS
        // Copies production .env files from Jenkins credentials store into
        // the workspace before any build or test stage reads them.
        // ──────────────────────────────────────────────────────────────────

        // ──────────────────────────────────────────────────────────────────
        // STAGE 6 — DEPLOY
        // 1. Start the database and wait for it to be ready.
        // 2. Run Django migrations.
        // 3. Collect static files.
        // 4. Recreate the backend and frontend containers from the new images.
        // Only runs on the main / master branch.
        // ──────────────────────────────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo '--- Deploying application ---'

                sshagent(credentials: ['autoconnect-prod-ssh']) {
                    sh '''
            ssh -tt -o StrictHostKeyChecking=no autoconnect@35.222.250.201 << 'EOF'

            set -e

            cd /home/kevin/quiz-challenge

            echo "Pulling latest code..."
            git pull origin main

            echo "Stopping old containers..."
            docker compose down

            echo "Building images..."
            docker compose build --no-cache backend frontend

            echo "Starting containers..."
            docker compose up -d

            echo "Waiting for PostgreSQL..."

            echo "Running migrations..."
            docker compose exec backend python manage.py migrate --noinput

            echo "Collecting static files..."
            docker compose exec backend python manage.py collectstatic --noinput --clear

            EOF
            '''
                }
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // STAGE 7 — HEALTH CHECK
        // Polls both service ports to confirm they are serving responses
        // before the build is marked successful.
        // ──────────────────────────────────────────────────────────────────
        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo '--- Running post-deploy health checks ---'
                sh '''
                    MAX_ATTEMPTS=15
                    SLEEP_SECONDS=4

                    echo "Checking backend (port 8000)..."
                    for i in $(seq 1 $MAX_ATTEMPTS); do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/quizzes/ || true)
                        if [ "$STATUS" = "200" ]; then
                            echo "  Backend OK — HTTP 200"
                            break
                        fi
                        echo "  attempt $i/$MAX_ATTEMPTS — HTTP $STATUS, retrying in ${SLEEP_SECONDS}s..."
                        sleep $SLEEP_SECONDS
                        if [ "$i" = "$MAX_ATTEMPTS" ]; then
                            echo "ERROR: Backend did not become healthy within the expected window."
                            exit 1
                        fi
                    done

                    echo "Checking frontend (port 5173)..."
                    for i in $(seq 1 $MAX_ATTEMPTS); do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ || true)
                        if [ "$STATUS" = "200" ]; then
                            echo "  Frontend OK — HTTP 200"
                            break
                        fi
                        echo "  attempt $i/$MAX_ATTEMPTS — HTTP $STATUS, retrying in ${SLEEP_SECONDS}s..."
                        sleep $SLEEP_SECONDS
                        if [ "$i" = "$MAX_ATTEMPTS" ]; then
                            echo "ERROR: Frontend did not become healthy within the expected window."
                            exit 1
                        fi
                    done

                    echo "All health checks passed."
                '''
            }
        }
    }
}

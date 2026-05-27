Запуск backend, frontend и инфраструктуры одной командой:
        bash /srv/clone/infra/scripts/start_cogiteka_hybrid.sh
        После успешного запуска стенд должен быть доступен локально на:

        http://127.0.0.1:8000 — backend;

        http://127.0.0.1:3001 — frontend.


Остановка backend, frontend и postgres/redis:
    bash /srv/clone/infra/scripts/stop_cogiteka_hybrid.sh

Смотреть backend и frontend логи в реальном времени:
    tail -f /srv/clone/backend/uvicorn.log
    tail -f /srv/clone/frontends/cogitor-ui/npm-start.log

Если нужно посмотреть логи контейнеров postgres/redis, используй:
    cd /srv/clone
    docker compose logs -f postgres redis
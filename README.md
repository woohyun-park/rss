# RSS Feeds

GitHub Pages로 배포되는 개인 블로그 RSS 생성기입니다.

## Feeds

- 통합 피드: <https://woohyun-park.github.io/rss/feed.xml>
- Evan Moon: <https://woohyun-park.github.io/rss/feeds/evan-moon.xml>
- hoseung.me: <https://woohyun-park.github.io/rss/feeds/hoseung.xml>
- Hewon Jeong: <https://woohyun-park.github.io/rss/feeds/hewon.xml>
- hiddenest: <https://woohyun-park.github.io/rss/feeds/hiddenest.xml>
- 개발자 단민: <https://woohyun-park.github.io/rss/feeds/jeong-min.xml>
- 강동윤 (kdy1): <https://woohyun-park.github.io/rss/feeds/kdy1.xml>
- 코드쓰는사람: <https://woohyun-park.github.io/rss/feeds/taegon-kim.xml>

## Local Commands

```bash
npm install
npm test
npm run check
npm run build
```

`npm run build`는 `dist/`에 `feed.xml`, 출처별 RSS, 상태 페이지를 생성합니다. Evan Moon은 기존 RSS가 아니라 Gatsby page-data를 읽어 새 피드를 생성합니다.

## Deployment

GitHub Actions workflow는 매일 한 번 실행되며 수동 실행도 지원합니다. Repository Settings에서 Pages source를 `GitHub Actions`로 설정해야 합니다.

# MoE-DAgger 프로젝트 홈페이지

논문, supplementary video, 두 실제 로봇 과제와 분석 GIF를 소개하는 정적 프로젝트 페이지입니다. HTML/CSS/JavaScript로 구성되어 별도 패키지 설치나 빌드가 필요하지 않습니다.

게시 주소: **https://SJ824.github.io/MoE-DAgger/**

최종 논문: [arXiv:2611.10825](https://arxiv.org/abs/2611.10825), v1 (2026-11-07). 동봉 PDF는 `2611.10825v1.pdf` 원본이며, 화면·복사·다운로드의 BibTeX는 공식 arXiv export와 같습니다.

## 1. GitHub 저장소에 넣기

압축을 푼 뒤 **`index.html`이 들어 있는 폴더의 내용물**을 기존 `SJ824/MoE-DAgger` 저장소의 최상위에 복사합니다. ZIP 파일 자체를 업로드하거나, `index.html`이 한 단계 아래 폴더에 남도록 넣으면 안 됩니다. 동봉된 `.nojekyll`도 함께 포함합니다.

| 저장소 루트의 항목 | 역할 |
| --- | --- |
| `index.html` | 홈페이지 진입점 |
| `site-config.js` | arXiv·코드 공개 주소와 메타데이터 |
| CSS / JavaScript 파일 | 페이지 스타일과 상호작용 |
| `assets/` | 논문 PDF, 편집 영상, GIF, 정적 이미지 |
| `.nojekyll` | 파일을 Jekyll 처리 없이 게시하기 위한 설정 |
| `README.md`, `MEDIA.md` | 게시 방법과 미디어 출처·편집 기록 |

아래 명령은 **이미 clone한 저장소의 현재 브랜치가 `main`인 경우**의 예입니다. 경로를 본인의 저장소 위치로 바꾸고, 파일을 복사한 다음 실행합니다. `git status`와 변경 목록에서 이번에 올릴 프로젝트 페이지 파일이 맞는지 확인합니다.

```bash
cd /path/to/MoE-DAgger
git status
git branch --show-current
git add .
git diff --cached --stat
git commit -m "Add MoE-DAgger project homepage"
git push origin main
```

## 2. GitHub Pages 설정

처음 게시할 때 저장소의 **Settings → Pages → Build and deployment**에서 다음과 같이 설정합니다.

1. **Source:** `Deploy from a branch`
2. **Branch:** `main`
3. **Folder:** `/(root)`
4. **Save** 선택

이미 같은 설정으로 게시 중이라면, 파일을 교체하고 `main`에 push하면 이후 배포가 진행됩니다. 완료 여부는 저장소의 **Actions** 또는 **Settings → Pages**에서 확인합니다. 여기서 지정한 게시 주소의 `MoE-DAgger` 대소문자를 유지합니다.

공식 안내: [GitHub Pages 게시 소스 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 3. 공개 정보와 향후 수정

- **arXiv:** `site-config.js`의 `arxivUrl`은 `https://arxiv.org/abs/2611.10825`입니다. 상단 arXiv 링크는 JavaScript 없이도 동작합니다.
- **논문 PDF:** `assets/paper/moe-dagger.pdf`는 `2611.10825v1.pdf`와 바이트 단위로 동일합니다. 페이지의 PDF 링크에는 v1 버전 값이 포함되어 있습니다.
- **인용:** `citation.bib`는 공식 arXiv BibTeX export입니다. `index.html`의 `#bibtex`와 같은 내용으로 유지합니다. Copy BibTeX는 화면에 표시된 내용을 복사하고 Download .bib는 실제 파일을 내려받습니다.
- **코드:** 연구 코드 주소는 아직 제공되지 않아 `codeUrl`은 빈 문자열입니다. 공개 시 실제 코드 저장소 URL을 넣습니다.
- **차기 논문 버전:** PDF, 인용 정보, HTML의 논문 메타데이터와 링크 버전을 함께 확인합니다. 제목·저자·결과가 달라지면 본문도 업데이트합니다.
- **캐시:** CSS 또는 JavaScript를 변경하면 `index.html`의 해당 파일 주소에 붙은 `?v=` 값을 갱신합니다. 현재 값은 파일 내용의 SHA-256 앞 12자리입니다.

수정 후 미리보기와 변경 내용을 확인하고 commit / push합니다.

## 4. 로컬 미리보기

`index.html`이 있는 폴더에서 실행합니다.

```bash
python3 -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000)을 엽니다. 서버는 터미널에서 `Ctrl+C`로 종료합니다.

`index.html`을 직접 열어 `file:///…/index.html`로 볼 수도 있습니다. 다만 로컬 파일에서의 동영상 재생과 일부 브라우저 기능은 브라우저별로 다를 수 있어 위 HTTP 미리보기를 권장합니다.

## 5. 미디어와 재생 UI

Green / Red 과제 GIF 두 개는 제공된 원본을 바이트 단위로 그대로 유지했습니다. 나머지 분석 영상 다섯 개는 실제 GIF 파일로 변환했으며, 원본에 들어 있는 0.5× / 1.5× 재생 속도는 그대로 보존했습니다. 추가한 Red second-push GIF는 두 inference의 external·wrist 카메라를 2×2로 합성한 20초 / 1× 영상입니다. 상세 매핑과 해시는 [MEDIA.md](MEDIA.md)에 있습니다.

GIF UI의 구성 사양은 지연 로딩, 재생·정지/처음부터 재생, 확대 보기입니다. GIF 정지는 정적 포스터로 전환하는 방식이며, 비디오처럼 임의의 프레임에서 정지하거나 탐색하는 방식은 아닙니다. 정지 후 다시 재생하면 처음부터 시작합니다. 확대 보기에서는 그래프와 주석을 더 크게 확인할 수 있습니다.

주요 미디어 파일 크기는 다음과 같습니다. `MiB = 1,048,576 bytes`입니다.

| 파일 | 크기 |
| --- | ---: |
| `tasks-green.gif` | 37.87 MiB |
| `tasks-red.gif` | 29.48 MiB |
| `router-probabilities.gif` | 30.33 MiB |
| `without-veto.gif` | 30.38 MiB |
| `complete-rule.gif` | 17.56 MiB |
| `high-entropy.gif` | 10.83 MiB |
| `causal-entropy.gif` | 5.14 MiB |
| `red-second-push.gif` | 49.97 MiB |
| `supplementary.mp4` | 26.59 MiB |
| `moe-dagger.pdf` | 2.18 MiB |

동봉된 개별 파일은 모두 100 MiB 미만입니다. 일부가 GitHub 브라우저 업로드 한도인 25 MiB를 넘으므로 이 패키지는 **Git으로 commit / push**하는 방식을 사용합니다. GitHub는 일반 Git 저장소에서 100 MiB를 초과하는 개별 파일을 차단합니다. ZIP 자체를 저장소에 추가하지 않습니다.

공식 안내: [GitHub 대용량 파일 제한](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

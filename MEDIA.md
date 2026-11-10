# 미디어 출처와 편집 기록

아래 경로는 홈페이지 루트 기준입니다. 논문의 정량 결과와 영상의 설명용 replay는 구분하여 해석합니다.

## 원본 9개와 배포 파일 매핑

| 입력 파일 | 홈페이지 배포 파일 | 처리 / 재생 속도 |
| --- | --- | --- |
| `2611.10825v1.pdf` | `assets/paper/moe-dagger.pdf` | arXiv v1 원본 복사, 파일명만 정리 |
| `2027_ICRA_VI.mp4` | `assets/videos/supplementary.mp4` | 앞·뒤 학회 타이틀 구간을 제외하여 편집; 본문 속도 유지 |
| `external_wrist_combined_green_20fps.gif` | `assets/gifs/tasks-green.gif` | 원본 바이트 그대로, 20 fps |
| `external_wrist_combined_red_20fps.gif` | `assets/gifs/tasks-red.gif` | 원본 바이트 그대로, 20 fps |
| `external_wrist_router_probability_2x2.mp4` | `assets/gifs/router-probabilities.gif` | 15 fps GIF 변환; 표시된 시간축 기준 1× 유지 |
| `external_wrist_without_veto_peak_trigger_paper_ready.mp4` | `assets/gifs/without-veto.gif` | 15 fps GIF 변환; 표시된 시간축 기준 1× 유지 |
| `external_wrist_causal_entropy_phase_probability_half_speed.mp4` | `assets/gifs/causal-entropy.gif` | 15 fps GIF 변환; 원본의 0.5× 유지 |
| `external_wrist_router_probability_p3_entropy_gt_0p50_half_speed.mp4` | `assets/gifs/high-entropy.gif` | 15 fps GIF 변환; 원본의 0.5× 유지 |
| `external_wrist_complete_rule_until_p2_p3_paper_ready_1p5x.mp4` | `assets/gifs/complete-rule.gif` | 15 fps GIF 변환; 원본의 1.5× 유지 |

다섯 분석 MP4 원본은 배포용 `assets/`에 중복 포함하지 않습니다. 각 GIF와 이름이 같은 WebP 정적 포스터는 `assets/images/`에 있으며, supplementary video 포스터는 `assets/images/supplementary-poster.webp`입니다.

## Supplementary video 편집

보존 구간은 원본 기준 **7.233333초 이상, 168.233333초 미만**입니다. 편집 영상 길이는 **161.000초(2분 41초)**이며, H.264 영상 / AAC 음성과 웹 재생용 fast-start 설정으로 내보냅니다.

첫 화면은 “Two Real-Robot Tasks with a Phase Structure” 슬라이드입니다. 첫 내레이션의 음성 시작 신호는 약 7.260초에 관측되어 그보다 약 0.026초 앞의 프레임에서 자릅니다. 마지막 본문 음성은 약 167.180초에 끝나며, 깨끗한 마지막 비교 슬라이드를 약 1초 더 유지한 뒤 종료하도록 설정했습니다. 앞·뒤 학회 타이틀과 그 전환 구간은 보존 구간 밖에 있습니다.

컷 지점은 시작·끝 프레임, 슬라이드 contact sheet, 오디오 진폭과 무음 구간으로 판단했습니다. 음성 전체에 대한 별도 전사 검증을 수행했다는 의미는 아닙니다.

## 분석 GIF가 보여 주는 내용

| GIF | 해석 |
| --- | --- |
| `router-probabilities.gif` | 성공한 Green rollout의 외부·손목 시점, P0–P4 확률, entropy. 정상적인 순차 routing을 보여 줍니다. |
| `without-veto.gif` | 성공한 Green 기록에 대해 전이 veto를 제거한 **설명용 counterfactual replay**입니다. 정상 handoff의 entropy peak에서 proposal이 발생하는 예이며, 실제 active no-veto 학습 실험 자체를 촬영한 영상으로 해석하면 안 됩니다. |
| `causal-entropy.gif` | Red의 **no-contact 실패 예시**입니다. P1/P2 부근의 지속되는 모호성, causal entropy, router support, trigger와 veto 상태를 함께 보여 줍니다. |
| `high-entropy.gif` | Green의 **partial-push 실패 예시**입니다. 뒤쪽 withdrawal / home-return 구간에서 이전·비인접 P0 support가 나타나는 장면입니다. 높은 entropy가 있는 성공한 handoff 예시로 설명하지 않습니다. |
| `complete-rule.gif` | Red의 **collision 실패 trace**를 완전한 acquisition rule로 causal replay한 예입니다. correction proposal과 collision 이전의 시간 관계를 보여 줍니다. 실제로 사람이 개입하여 실패를 복구한 새 rollout을 뜻하지 않습니다. |

영상은 작동 원리를 설명하는 사례입니다. 독립적인 성공률 측정이나 새로운 정량 평가 trial로 계산하지 않습니다.

## GIF 인코딩과 길이

변환한 다섯 GIF는 1100 × 619 px, 15 fps, 256색 palette, Bayer dithering과 무한 반복을 사용합니다. 원본 재생 속도를 바꾸거나 앞·뒤 내용을 의도적으로 자르지 않았습니다. GIF 시간 단위의 반올림으로 최대 0.04초 차이가 있습니다.

| GIF | 원본 길이 | GIF 길이 | 파일 크기(bytes) |
| --- | ---: | ---: | ---: |
| `causal-entropy.gif` | 5.200 s | 5.200 s | 5,390,158 |
| `complete-rule.gif` | 10.133 s | 10.140 s | 18,409,664 |
| `router-probabilities.gif` | 15.300 s | 15.340 s | 31,806,435 |
| `high-entropy.gif` | 7.600 s | 7.600 s | 11,351,576 |
| `without-veto.gif` | 15.300 s | 15.340 s | 31,860,563 |
| `tasks-green.gif` | 15.300 s | 15.300 s | 39,714,164 |
| `tasks-red.gif` | 13.500 s | 13.500 s | 30,910,329 |

원본 과제 GIF 두 개는 960 × 270 px / 20 fps 그대로입니다. 두 과제의 WebP 포스터에는 각각 원본의 5초 프레임을 사용했습니다.

## 원본 과제 GIF 보존 확인

아래 SHA-256은 입력 GIF와 이름을 바꾼 배포 GIF 양쪽에서 동일합니다.

| 파일 | SHA-256 |
| --- | --- |
| `tasks-green.gif` | `cb4e4c10590f64bb951ad0d5c1a349010465f3384da05e7548b8cc70764163b8` |
| `tasks-red.gif` | `8caa356c7399d036826fee6187b6886a671ddcc9542d0596649119b5bb6452bc` |


## Red second-push 두 inference의 2×2 합성

`03 / INSIDE THE DECISION`의 **06 Second push** 항목은 첫 push에서 큐브를 충분히 밀지 못한 뒤 다시 push하는 두 실제 Red inference를 보여 줍니다. 각 행은 독립적인 rollout이며, 같은 행의 두 카메라는 같은 기록 프레임에 맞춰 동기화합니다. 두 행은 각각의 시작 시점을 0초로 맞춰 동시에 재생합니다.

| 위치 | 입력 파일 (`homepage/` 기준) |
| --- | --- |
| 위 / external | `higher_red_push_nominal_dagger_iter001_trial001_20260723_150415_pid214811/video/external.mp4` |
| 위 / wrist | `higher_red_push_nominal_dagger_iter001_trial001_20260723_150415_pid214811/video/wrist.mp4` |
| 아래 / external | `higher_red_push_nominal_dagger_iter001_trial001_20260723_145448_pid211843/video/external.mp4` |
| 아래 / wrist | `higher_red_push_nominal_dagger_iter001_trial001_20260723_145448_pid211843/video/wrist.mp4` |

배포 파일은 `assets/gifs/red-second-push.gif`, 포스터는 `assets/images/red-second-push.webp`입니다. 각 화면 위에 rollout 번호와 카메라 이름을 표시했습니다.

- 네 MP4 원본: 각각 640 × 360 px, 20 fps, 400프레임, 20.000초.
- 원본 프레임 순서를 유지하며 544 × 306 px로 등비 축소하고, 38 px 제목 띠와 12 px 간격을 추가했습니다. 카메라 화면을 자르거나 늘이지 않았습니다.
- 배포 GIF: **1100 × 700 px, 15 fps, 300프레임, 20.000초, 1× 속도**, 256색 palette / Bayer dithering(scale 5), 무한 반복. 기존 분석 GIF와 같은 15 fps로 변환하면서 실제 재생 시간은 유지했습니다.
- 포스터: 합성 영상의 12초 프레임.
- 앞뒤 자르기, 행별 속도 변경, 마지막 프레임 연장 없이 전체 20초를 사용했습니다. 입력 음성은 없습니다.
- router 확률, entropy 또는 correction proposal을 추가로 그리지 않았습니다. 이 두 사례를 새로운 성공률 평가에 합산하거나 최종 성공을 입증하는 영상으로 표시하지 않습니다.

GIF 파일 크기: **52,396,090 bytes (49.97 MiB)**.

| 파일 | SHA-256 |
| --- | --- |
| `assets/gifs/red-second-push.gif` | `e75a6f2766cf25df4b8c506c94c33e3014c744a02f5358695b8a91733e5ef705` |
| `higher_red_push_nominal_dagger_iter001_trial001_20260723_150415_pid214811/video/external.mp4` | `7e9a8549da931b5181cefc246697a929345234089486909e43d9ea4109cf8aa8` |
| `higher_red_push_nominal_dagger_iter001_trial001_20260723_150415_pid214811/video/wrist.mp4` | `6312e8ca77fd2548125be2d90489c5ae2428baf5a7fe944e51a5334e8b703156` |
| `higher_red_push_nominal_dagger_iter001_trial001_20260723_145448_pid211843/video/external.mp4` | `8aef978f5d529387c8449f80900894ea92d97cb836b8485c22eb7c347a4a4baa` |
| `higher_red_push_nominal_dagger_iter001_trial001_20260723_145448_pid211843/video/wrist.mp4` | `51d54aa2342b9ff6459dde2e3413a80a4d3427c5826a420fdeae56e218fdab8b` |


## arXiv v1 최종 논문 반영 (2026-11-10)

- 출처: https://arxiv.org/abs/2611.10825 (v1, 2026-11-07).
- 입력: `2611.10825v1.pdf`, 9페이지, 2,282,830 bytes.
- 배포: `assets/paper/moe-dagger.pdf`; 원본을 편집 없이 복사했습니다.
- 입력과 배포 PDF의 SHA-256: `ca4275163c15b37a54f4da029c4bf1fa78c5e39e938f53aea0be62752ced69fa`.
- arXiv 식별자 표기와 공백을 제외한 PDF 추출 본문은 이전 manuscript와 일치합니다. 기존 그림·표·결과 수치를 유지했습니다.
- `citation.bib`와 화면의 인용 정보는 공식 arXiv export를 사용합니다.


## 웹 재생용 MP4 최적화 (2026-11-10)

화면의 Green / Red 과제, Choose a clip 6개, 확대 보기는 `assets/videos/clips/`의 MP4를 사용합니다. 기존 GIF와 WebP 포스터는 변경하지 않았습니다. GIF 전체 다운로드 및 디코딩을 기다리던 지연을 줄이기 위한 재생용 파생 파일입니다.

- 입력: 같은 슬러그의 배포 GIF. H.264/libx264 CRF 21, medium, yuv420p, 무음, `+faststart`.
- 각 프레임 개수와 presentation timestamp는 원본 GIF와 일치합니다. 1100×619 파일은 하단에 흰색 1픽셀을 덧붙여 1100×620으로 인코딩했습니다.
- complete-rule/router-probabilities/without-veto는 마지막 프레임 길이 추론 차이로 컨테이너 duration만 0.01초 짧습니다. 모든 프레임과 해당 프레임의 재생 시점은 보존했습니다.
- 모든 MP4에서 moov가 mdat보다 앞에 있어 다운로드 도중 재생할 수 있습니다. Second push SSIM: 0.986698.
- 총 211.56 MiB → 16.80 MiB, 92.06% 감소. 기존 GIF 다운로드 링크는 유지합니다.

| MP4 파일 | 크기(bytes) | SHA-256 |
| --- | ---: | --- |
| `causal-entropy.mp4` | 751,855 | `21f0e4538dc384fd7ef1d87490296bd77a2658635ae33fc0593b4128729a5ac4` |
| `complete-rule.mp4` | 1,809,051 | `fe42802ddac8a04da2c3632b9e500b29389d349c910569656e7f468896ec9620` |
| `high-entropy.mp4` | 1,100,477 | `262e46e3aafdcee12e58daefa3e789854672951091fb3d7a7495d9bce68af8a7` |
| `red-second-push.mp4` | 3,566,990 | `e58b720d9752e9f0ef3aaf2c6dc3c4ffee8d556b27b619ea2da068e9b4af7c82` |
| `router-probabilities.mp4` | 2,954,539 | `1a04c3ff8590233280b3c133bf672eb2f4fb68f251d1d1d564c548bcebf50be8` |
| `tasks-green.mp4` | 2,726,885 | `5a476c0b29f9b7abe9998a92184b4e26f41dd043b849157536f9c802b14b9caf` |
| `tasks-red.mp4` | 1,866,555 | `d448fbf8dffff12bbd0492c83fe857397b102e32fb1ebb3366ab1026eaa9f91e` |
| `without-veto.mp4` | 2,836,332 | `bc95c94ed3e41edca8d2c011bc9a67dbf7496fe1e2e8d2966d11d5a503b8f59f` |

# 게시용 문구

## Figma Community skill

Name: MD to Figma Assistant

Tagline: Turn design tokens and exports into import-ready Markdown.

Description:

Prepare design-system Markdown for the MD to Figma plugin with guidance in your language.

Use this skill with your design tokens, CSS, existing Markdown, or an MD to Figma export. It helps organize your data into the supported format, preserve collection and token names, retain custom modes and explicit references, and explain the changes before you import.

The skill covers colors, typography, spacing, radius, effect styles and layout guide styles. Motion variables and motion styles are optional. Missing categories stay omitted, and example tokens are not added to your project automatically.

How to use:
1. Add the skill and invoke /md-to-figma.
2. Attach your source data and describe the changes you want.
3. Copy the resulting Markdown into the existing MD to Figma plugin.
4. Select the recommended Variables and Styles options, then review the QA report and actual values and bindings in Figma.
5. Export again to compare and keep your updated source document.

This skill prepares Markdown. You choose the destination Figma file and perform the import using the separate MD to Figma plugin. Renamed items can create new entries while the originals remain. Figma API availability, installed fonts and destination-file bindings must be checked after import.

Compatible with MD to Figma v2.1.0. Assistant package version: 0.1.1.

## AI plugin listing

Display name: MD to Figma Assistant

Short description: Prepare design-system MD for Figma import

Long description:

Convert design tokens or revise MD to Figma exports while preserving collection names, arbitrary modes and explicit style bindings. Explains changes and import choices in the user's language. Includes format references, the existing template and integration sample, and an optional local Markdown preflight checker. Import is performed by the user with the existing Figma plugin.

## 호스트 테스트용 요청

아래 요청은 원본 자료와 함께 사용합니다. 최종 결과의 JSON·섹션 이름은 번역하지 않고, 안내만 요청 언어로 제공하는지 확인합니다.

1. 한국어: 이 Export MD의 형식만 정리해줘. 이름, 값, 모드와 참조를 보존하고 필요한 등록 옵션을 알려줘.
2. English: Change only the gap value in the Compact mode to 12. Preserve every other mode, collection, token and binding. Explain how to import the result.
3. 日本語: このMDのデータだけを使って形式を整えてください。存在しないスタイルやモーションは追加せず、変更点を日本語で説明してください。
4. 누락 데이터: 이 파일에는 스페이싱만 있어. 컬러나 모션 예시를 추가하지 말고 있는 데이터만 정리해줘.
5. 오류 수정: 이 MD와 QA 로그를 보고 Noise의 blendMode 오류만 수정해줘. 나머지 데이터와 바인딩은 유지해줘.

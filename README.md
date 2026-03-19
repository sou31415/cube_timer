# Cube Timer

3x3向けのWebタイマー。

## 機能

- タップでインスペクション開始、0.2秒長押しで計測開始
- 15秒インスペクションとWCA準拠の +2 / DNF 判定
- `cubing.js` による random-state 3x3 スクランブル生成
- インスペクション8/12/15秒の視覚変化とバイブ補助
- 直前記録、単純平均、Ao5、best Ao5文脈表示
- 停止直後のミニフィードバックと即時修正（+2 / DNF / undo）
- スクランブル先読みキューによる次スクランブル即時表示
- 一定本数ごとの休憩提案
- LocalStorage保存とセッション復元
- PWAマニフェストとService Workerによるオフライン起動

## 実行

```bash
npm install
npm run dev
```

必要に応じて `npm run build` で本番用アセットを生成する。

## テスト

```bash
npm test
```

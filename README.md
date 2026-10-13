# Kiemel (2008) 2リンク姿勢制御デモ

Kiemel, Elahi & Jeka (2008) の身体プラントモデルを、定常周波数応答として可視化する独立したHTML/CSS/JavaScriptアプリです。既存のQuest・Firebase・VRコードには依存しません。

## 起動

`kiemel_demo` で静的HTTPサーバーを起動します。

```powershell
cd kiemel_demo
python -m http.server 8080
```

ブラウザで `http://localhost:8080` を開いてください。外部ライブラリ・ビルド工程はありません。`index.html` を直接開いても基本機能は動作します。

## 操作

- 周波数スライダー：0.024〜2.936 Hz（対数スケール）
- プリセット：0.1 / 0.2 / 0.8 / 1.2 / 1.5 Hz
- 表示倍率：アニメーションだけを1〜100倍に拡大（計算値は不変）
- 比較モード：左右で周波数だけを変え、同じ身体・同じ共通入力振幅を比較
- グラフ：時間応答、プラントのゲイン・位相、能動関節トルクのゲイン・位相

## モデル

- `model.js` の `response()` が論文式(4)、式(5a)、式(5b)に対応します。
- Table 1 の平均人体パラメータと Table 2 の高振幅条件を使用します。
- `u(t)` は全筋EMGを表す単一の正規化入力です。視覚刺激角度はプラントへ直接入力しません。アニメーションでは一定振幅 `A = 0.02` を使い、グラフは単位入力あたりで表示します。
- 論文モデルは受動的に不安定なため、時系列の初期値問題は積分しません。各周波数で複素周波数応答を解き、その定常正弦波を表示します。これは入力開始後の安定な過渡応答を意味しません。
- 論文モデル固有の仮定（小角度線形化、膝固定の2リンク、集中筋腱アクチュエータ）以外に、力学式を教育用に簡略化していません。描画時の表示倍率のみ、物理計算から分離しています。

## 検証

```powershell
node verify.js
```

全周波数で有限の応答が得られること、0.024 Hzで脚・体幹がほぼ同相、2.936 Hzで位相差が100°を超えることを確認します。これらは論文 Figure 5/6 の「低周波で同相、高周波で脚が体幹より大きく遅れる」という定性的特徴の検証です。

## 出典

Kiemel T, Elahi AJ, Jeka JJ. *Identification of the Plant for Upright Stance in Humans: Multiple Movement Patterns From a Single Neural Strategy*. J Neurophysiol. 2008. [PMC2604857](https://pmc.ncbi.nlm.nih.gov/articles/PMC2604857/)

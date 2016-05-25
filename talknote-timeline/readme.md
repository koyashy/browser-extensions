# Talknote-timeline extension
## 概要
Talknote「お知らせ」（[URL](https://company.talknote.com/*/news/)）にて、投稿やコメントを先読みしてページ内に展開し、リンク先へ遷移すること無く内容を確認できるようにする拡張機能です。

## 対応ブラウザ
- Safari： バージョン```9.1 (11601.5.17.1)```にて動作確認
- Chrome： バージョン```49.0.2623.75 (64-bit)```にて動作確認

## インストール方法
### Safari
[Safari用拡張機能ファイル](https://s3-ap-northeast-1.amazonaws.com/mediba-browser-extensions/talknote-timeline/latest/talknote-timeline.safariextz)をダウンロードしてSafariで開きます。
### Chrome
[Chrome用拡張機能](https://chrome.google.com/webstore/detail/talknote-timeline-extensi/gdcijghkiblfepdomdchpfkmalpncccp)をインストールします。

# 開発
[実装](implement.md)

## Safariでの開発
[公式ドキュメント](https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/Introduction/Introduction.html)

ここが結構まとまっている。少し古いけど
http://os0x.hatenablog.com/entry/20100610/1276119135

## Chromeでの開発
[公式ドキュメント](https://developer.chrome.com/extensions)

参考
http://liginc.co.jp/web/tool/browser/163575

## テスト
1度だけテストを実行します。
```
npm test
```
変更を監視してテストを実行します。
```
npm run ct
```

## ビルド
```
npm run build
```

- Safari用のディレクトリ： ```build/safari/talknote-timeline.safariextension```
- Chrome用のディレクトリ： ```build/chrome/talknote-timeline.safariextension```

それぞれのディレクトリを各ブラウザの拡張機能管理画面から読み込むことで、デバッグすることができます。

## バージョンアップ
以下のコマンドでpackage.jsonのバージョンを更新します。
```
npm version [patch|minor|major]
```
ビルドした拡張機能を各ブラウザの拡張機能管理画面からパッケージングします。

Safari版については、更新情報ファイル、拡張機能パッケージともS3にホストしています。  
https://s3-ap-northeast-1.amazonaws.com/mediba-browser-extensions/talknote-timeline/
latest/配下に最新の拡張機能ファイルを置くとともに、vX.X.X/配下に該当のバージョンを置きます。

Chrome版については、マーケットプレイスに限定公開しています。

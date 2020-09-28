# Choices-AWS-Lambda-RDS
Amazon RDS のデータを [Questetra BPM Suite](https://questetra.com/) の「検索セレクトボックス」の外部マスタとして使用するための 
AWS の [Terraform](https://www.terraform.io/) テンプレートです。

チュートリアル記事は[こちら](https://support.questetra.com/ja/developer-blog/choices-aws-lambda-rds-terraform/)。

## 注意点
RDS Proxy は現時点では Terraform に対応していないため、RDS Proxy を使用する場合は別途 AWS コンソールで追加する必要があります
（本テンプレートでは RDS Proxy を経由せずに直接 RDS に接続します）。

## 事前準備
以下のものが必要です。
* [Terraform](https://www.terraform.io/downloads.html)
* [AWS CLI](https://aws.amazon.com/cli/)
* [MySQL クライアント](https://www.mysql.com/) コマンド
* [Node.js](https://nodejs.org/) / [npm](https://www.npmjs.com/) コマンド

AWS の認証情報は `aws configure` コマンドで設定するか、provider.tf ファイル内の provider ブロック内に記載します（[参考](https://www.terraform.io/docs/providers/aws/index.html#static-credentials)）。

lambda-src ディレクトリ内で `npm install` を実行し、必要なパッケージをインストールしておきます（node_modules ディレクトリが作成されます）。

## 使い方
同じディレクトリに .tfvars ファイル（たとえば vars.tfvars）を作成し、 variables.tf で定義されている変数の値を指定します
（mysql コマンドでデータベースに接続できるように、my_ip に自分の PC の IP アドレスを CIDR 表記で設定します）。

### vars.tfvars の例
```
aws_region = "us-east-2"
my_ip = "{自分の PC の IP アドレス（CIDR 表記）}"
db_password = "password1234"
```

ディレクトリ内で `terraform init` を実行してワークスペースとして初期化し、
`terraform plan -var-file=vars.tfvars` で変更内容を確認します。

変更内容に問題がなければ、`tarraform apply -var-file=vars.tfvars` で変更を実行します。

次のように表示されると AWS のリソース作成は完了です。
```
Apply complete! Resources: 21 added, 0 changed, 0 destroyed.

Outputs:

api_url = {API のエンドポイント}
db_endpoint = {データベースのエンドポイント}
```

出力されたデータベースのエンドポイントを使ってデータベースに接続し、後述のデータ形式にしたがってテーブルを作成します。

Questetra BPM Suite の「検索セレクトボックス（表示名は「検索セレクト」）」の「選択肢種別」で「HTTP 経由で取得した選択肢」を選択し、
「選択肢データの URL」に API のエンドポイントを入力します。

## データベースへの接続
データベースへの接続には次の mysql コマンドを使います。コマンドの後、.tfvars ファイルで設定したマスターパスワードを入力します。
```
mysql -h {データベースのエンドポイント} -P 3306 -u admin -p
```
3306 はポート番号、admin はマスターユーザー名です。.tfvars ファイルでマスターユーザー名を設定した場合は、設定したユーザー名を使用します。

## データ形式
データベースには `value` と `display` の２つの列からなるテーブルを作成します。
value は選択肢ID、display は表示ラベルです。

### テーブル作成例
```
create database sample_db;
use sample_db;
CREATE TABLE `nations` (
  `value` VARCHAR(10) NOT NULL PRIMARY KEY,
  `display` VARCHAR(100) NOT NULL
) DEFAULT CHARSET=utf8;
INSERT INTO nations (value, display)
    VALUES
      ("JP", "日本"),
      ("US", "アメリカ"),
      ("UK", "イギリス"),
      ("AU", "オーストラリア");
```
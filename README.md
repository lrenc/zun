# ZUN

百度前端代码格式化工具，旨在对你的代码进行风格格式化，当然ZUN也为你如何**快速提交代码**提供了解决方案

## 安装

```
    $ npm install zun -g
```

## 如何使用

首先进入你的工作目录

```
    cd your_workspace
```
- ZUN 默认只对代码模块中有新添加代码和有修改的文件进行格式化处理，所以请确保当前目录处在svn的管理之下。同时，默认采取原文件覆盖模式。
```
    $ zun format(f)
```

- 如果修改的文件改动较少，且原有代码规范问题较多，可通过指定nomodify参数忽略修改的文件，只对新增文件格式化处理。
```
    $ zun format --nomodify
```

- 如果你对自己负责的模块很有把握，并且希望一次性格式化所有文件来减少后期代码规范的维护负担，可以使用all参数强制对所有文件进行格式化。
```
    $ zun format --all
```

- 指定格式化之后的文件输出路径，没有写明具体目录名则默认为当前目录下的output目录。
```
    $ zun format --directory your_directory
```
- 当然，你可以使用 --file(-f) 参数指定具体需要被格式化的文件，无需给出文件的完整路径，ZUN会帮你解决一切。
```
    $ zun format --file filename
```

- 有一些无法避免的变量命名规范问题，如ajax数据中，后端吐出的json数据使用了下划线命名，遇到这种情况，可以使用icc参数+文件名的形式强制取消该文件的变量命名规范检查。
```
    $ zun format --icc filename
```
- 同样，也可以对为定义的全局变量进行规避处理
```
    $ zun format --igv filename
```

- 快速提交提交代码评审，此命令需配置zun-conf.json文件使用
```
    $ zun cooder
```

- 如果没有检测到zun-conf文件，你只需要按照命令行提示的顺序输入，ZUN能够帮你完成zun-conf文件的建立，或者使用init命令，主动触发conf文件检查。
```
    $ zun init
```
- 最后是一个BUG级的功能，无条件生成一个可用的issue，好吧，由于svn的代码检查hook并没有对你提交的issue id中的diff与实际提交代码的diff进行一致性检查，所有，你可以通过伪造diff并获取到一个没有任何代码规范问题的issue，这并不是一个被推荐的命令。
```
    $zun issue
```

## zun-conf.json文件说明

在当前活动路径下配置zun-conf.json文件，该文件提供了两个功能：
- 对不需要格式化的文件（jquery等第三方文件）进行配置
- 设置cooder命令的属性内容。
```
{
    "cooder": {
        "subject"    : "code review",
        "owner"      : "wanghaojie01",
        "reviewers"  : "wanghaojie01",
        "description": "code review",
        "token"      : "the token"
    },
    "ignore": [
        "/static/js/core/*.js",
        "/static/css/reset.css"
    ]
}
```
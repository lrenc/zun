# zun

百度前端代码格式化工具

### 安装
```
    $ npm i zun -g
```

### 使用

zun默认只对代码模块中新添加的和有修改的文件进行格式化处理，所以请确保当前目录处在svn的管理之下。同时，默认采取原文件覆盖模式。
```
    $ zun format(f)
```

如果修改的文件改动较少，且原有代码规范问题较多，可通过指定nomodify参数忽略修改的文件，只对新增文件格式化处理。
```
    $ zun format --nomodify
```

如果你对自己负责的模块很有把握，并且希望一次性格式化所有文件来减少后期代码规范的维护负担，可以使用all参数强制对所有文件进行格式化。
```
    $ zun format --all
```

指定格式化之后的文件输出路径，没有写明具体目录名则默认为当前目录下的output目录。
```
    $ zun format --directory your_directory
```

有一些无法避免的变量命名规范问题，如ajax数据中，后端吐出的json数据使用了下划线命名，遇到此种情况，可以使用icc参数+文件名的形式强制取消该文件的变量命名规范检查。
```
    $ zun format --icc filename
```

快速提交提交代码评审，此命令需配置zun-conf.json文件使用
```
    $ zun cooder
```

如果没有检测到zun-conf文件，则需要以参数的形式添加必要的属性。
```
    $zun cooder --subject "subject" --owner "owner" --reviewers "reviewers" --description "description" --token "token" --sendmail "default false"
```

#### zun-conf.json文件说明

在当前活动路径下配置zun-conf.json文件，该文件提供了两个功能：对不需要格式化的文件（jquery等第三方文件）进行配置；设置cooder命令的属性内容。
```
{
    "cooder": {
        "subject": "code review",
        "owner": "wanghaojie01",
        "reviewers": "wanghaojie01",
        "description": "code review",
        "token": "the token"
    },
    "ignore": [
        "/static/js/core/*.js",
        "/static/css/reset.css"
    ]
}
```

该工具还在不断的完善之中，有好的意见或建议，欢迎提出。
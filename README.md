# 听音测试软件使用说明

## 测试流程

1. 实验者需要搭建一个网站，将该文件夹中所有文件复制到网站文件夹中，听音者即可通过网站对应域名或ip进行听音测试。（软件demo已上传至http://47.102.197.141/）
2. 听音测试前，实验者需要配置yaml文件，存入configs/文件夹（示例见config/example.yaml），并将用到的音源存入configs/resources/文件夹。
3. 在浏览器中输入http://47.102.197.141打开音量测试界面，可用于确定不同音频设备响度相同时的音量增益。
4. 在浏览器中输入http://47.102.197.141/?config=filename.yaml 打开听音测试界面（filename即需要进行的听音测试所对应的yaml文件名，例如http://47.102.197.141/?config=example.yaml ），将对应的输出通道接到不同的音频产品上后，即可开始听音测试。
5. 听音者完成听音测试，点击发送数据后，测试结果会存储在results/[testId]/test.csv文件中。（[testId]为yaml设置文件中testId对应的值，例如results/listening_test_example/test.csv）
   - csv文件中的数据以utf-8编码，如果csv文件中含有中文，导入excel时文件原始格式需要选择utf-8，否则可能出现乱码

## 设置文件示例（example.yaml）

```yaml
testname: 听音实验示例	# 测试名，将会显示在窗口顶部
testId: listening_test_example	# 本次测试对应id，听音测试数据会存入以该id命名的文件夹中（例如results/listening_test_example/test.csv），并且对应csv文件中session_test_id的值（注意：配置文件中所有id只能使用小写字母、数字和下划线的组合）
bufferSize: 2048	
stopOnErrors: true
showButtonPreviousPage: true	# 如果该值为true，则可以通过单击previous按钮返回上一页面
remoteService: service/write.php


pages:	# 每个“-”后的内容代表一页
    - type: generic	# type为generic的页面具有展示文字的功能
      id: first_page	#页面id
      name: 欢迎！	# 当前页面标题
      content: 点击next进入测试。   # 提示文本
    - type: test	# type为test的是听音测试页面
      id: test_1	# 该值对应csv文件中trial_id的值
      name: 测试1	# 当前页面标题，显示在窗口上方
      content: 评分并选择标签。 # 该值是提示文本，显示在窗口上方
      showWaveform: true	# 如果该值为true，则会显示音频文件的波形
      enableLooping: true 
      reference: configs/resources/audio/man.wav	# 该值是本页测试中使用的音频文件的相对路径
      defaultVolume1: 1.0	# 通道1默认音量（0~1）
      defaultVolume2: 0.1	# 通道2默认音量
      defaultVolume3: 1.0	# 通道3默认音量
      defaultVolume4: 1.0	# 通道4默认音量
      questionnaire:	# 标签设置，听音者选中的标签在csv文件中以键值对的形式储存在likert这一列，例如{"Full":"1","Dark-Bright":"Neutral"}
          - type: likert	# 第1组标签
            name: Full	#该组标签所在分类，在csv文件中对应的文本
            label: 饱满程度	# 该组标签所在分类，显示在窗口中的文本
            response:
              - value: 1	# 标签在csv文件中对应的文本
                label: 饱满的	# 标签显示在窗口中的文本
              - value: -1
                label: 单薄的	
          - type: likert	# 第2组标签
            name: Dark-Bright
            label: 明亮程度
            response:
              - value: Neutral
                label: 平衡的
              - value: Bright
                label: 刺耳的
              - value: Dark
                label: 暗淡的
    - type: test
      id: test_2
      name: 测试2
      content: 评分并选择标签。 
      showWaveform: true
      enableLooping: true 
      reference: configs/resources/audio/man.wav
      defaultVolume1: 1.0
      defaultVolume2: 0.1
      defaultVolume3: 1.0
      defaultVolume4: 1.0 
      questionnaire:
          - type: likert
            name: Full
            label: 饱满程度
            response:
              - value: 1
                label: 饱满的
              - value: -1
                label: 单薄的
          - type: likert
            name: Dark-Bright
            label: 明亮程度
            response:
              - value: Neutral
                label: 平衡的
              - value: Bright
                label: 刺耳的
              - value: Dark
                label: 暗淡的
    - type: finish	# type为finish的页面具有调查听音者信息和发送数据的功能
      name: Thank you
      content: 感谢参与测试!
      writeResults: true	# 选择是否发送数据
      questionnaire:	
          - type: text	#文本框
            label: eMail
            name: email
          - type: number	# 仅可填写数字的文本框
            label: 年龄
            name: age
            min: 0
            max: 100
            default: 30
          - type: likert	# 单选
            label: 性别
            name: gender
            response:
              - value: female
                label: 女性
              - value: male
                label: 男性
              - value: other
                label: 其他
```


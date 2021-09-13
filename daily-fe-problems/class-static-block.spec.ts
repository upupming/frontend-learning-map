/**
 * Class static block
 * 参考资料: https://github.com/ascoders/weekly/blob/master/%E5%89%8D%E6%B2%BF%E6%8A%80%E6%9C%AF/210.%E7%B2%BE%E8%AF%BB%E3%80%8Aclass%20static%20block%E3%80%8B.md
 */

describe('Class static block', () => {
  it('should be able initialize static variables', () => {
    class Translator {
      static translations = {
        yes: 'ja',
        no: 'nein',
        maybe: 'vielleicht'
      }

      static englishWords: string[] = []
      static germanWords: string[] = []
      static {
        for (const [english, german] of Object.entries(this.translations)) {
          this.englishWords.push(english)
          this.germanWords.push(german)
        }
      }
    }
    expect(Translator.englishWords).toStrictEqual(['yes', 'no', 'maybe'])
  })

  it('should run in the superclass-to-subclass, top-to-down ordered', () => {
    // 把所有日志放入 ans 中，后续检查一下 ans 是否符合顺序
    const ans: string[] = []
    function pushAns (msg: string) { ans.push(msg) }
    class SuperClass {
      static superField1 = pushAns('superField1')
      static {
        expect(this).toStrictEqual(SuperClass)
        pushAns('static block 1 SuperClass')
      }

      static superField2 = pushAns('superField2')
      static {
        pushAns('static block 2 SuperClass')
      }
    }

    class SubClass extends SuperClass {
      static subField1 = pushAns('subField1')
      static {
        expect(this).toStrictEqual(SubClass)
        pushAns('static block 1 SubClass')
      }

      static subField2 = pushAns('subField2')
      static {
        pushAns('static block 2 SubClass')
      }
    }

    expect(ans).toStrictEqual([
      'superField1',
      'static block 1 SuperClass',
      'superField2',
      'static block 2 SuperClass',

      'subField1',
      'static block 1 SubClass',
      'subField2',
      'static block 2 SubClass'
    ])
  })
})

[The week problem set](./problem-set.md)

The algorithm

- Given 10 ciphtertexts
- you have 9+8+7+6+5+4+3+2+1 = 45 pairs of mx XOR my
- if a (mx XOR my) result inside, ith pos has a letter, you know
  - in mx and my ith pos, one of them is a space, another one is that upper/lower case letter.
  - if you cross look at different messages of mx and my, you will be able to deduce whether the ith pos of mx is the space char.
  - going back to ith pos of mx. You can deduce the key used for ith pos

Todo:
  - you need test cases
  - add debug flag to disable the log msg
  - make the hexString and different conversion into a cmdline program

Further Learning:
  - learn documenting your code
    - jsdoc (https://jsdoc.app/about-getting-started.html)
    - tsdoc (https://tsdoc.org/)

References:
  - ASCII table: https://www.asciitable.com/

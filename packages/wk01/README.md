The algorithm

- Given 10 ciphtertexts
- you have 9+8+7+6+5+4+3+2+1 = 45 pairs of mx XOR my
- if a (mx XOR my) result inside, ith pos has a letter, you know
  - in mx and my ith pos, one of them is a space, another one is that upper/lower case letter.
  - if you cross look at different messages of mx and my, you will be able to deduce whether the ith pos of mx is the space char.
  - going back to ith pos of mx. You can deduce the key used for ith pos

notes:

- review the code is good
- need to count back for those j > i

Todo:

- you need test cases
- add debug flag to disable the log msg

further learning:

- learn documenting your code
  - jsdoc (https://jsdoc.app/about-getting-started.html)
  - tsdoc (https://tsdoc.org/)

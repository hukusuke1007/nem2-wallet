<template>
  <div id="app">
    <header>
      <router-link style="text-decoration: none; color: white;" to="/">
        <span>NEM2 wallet</span>   
      </router-link>
    </header>
    <div class="main__content">
      <v-fade-transition mode="out-in">
        <router-view/>
      </v-fade-transition>
    </div>
  </div>
</template>
<style lang="stylus">
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

#nav
  padding 30px
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
      color #42b983

header
  margin 0
  height 56px
  padding 0 16px 0 24px
  background-color #67b2e7
  color #ffffff

header span
  display block
  position relative
  font-size 25px
  line-height 1
  letter-spacing .02em
  font-weight 700
  box-sizing border-box
  padding-top 16px
  text-align left

.main__content
  margin 8px
</style>

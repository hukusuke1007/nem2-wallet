import { Address, Listener } from 'nem2-sdk'
import { map, filter } from 'rxjs/operators'
import { TransactionResult, TransactionConfirmType } from '@/domain/entity/TransactionResult'
import { TransactionError } from '@/domain/entity/TransactionError'

export class ListenerWrapper {
  endpoint: string
  listener: Listener

  constructor(endpoint: string) {
    this.endpoint = endpoint
    this.listener = new Listener(this.endpoint, WebSocket)
  }

  async loadStatus(addr: string, hash: string): Promise<TransactionResult> {
    try {
      return await this._loadStatus(addr, hash)
    } catch (error) {
      throw error
    }
  }

  private _loadStatus(addr: string, hash: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const address = Address.createFromRawAddress(addr)
      this.listener.open().then(() => {
        this.listener.status(address)
          .pipe(
            filter((item) => item.hash === hash),
            map((item) => new TransactionError(item.status, item.hash)),
          ).subscribe((response) => {
            console.error('loadStatus status', response)
            reject(response)
          })
        this.listener.unconfirmedAdded(address)
          .pipe(
            filter((item) => (item.transactionInfo !== undefined && item.transactionInfo.hash === hash)),
            map((item) => new TransactionResult('SUCCESS', item.transactionInfo!.hash!, TransactionConfirmType.Unconfirm)),
          ).subscribe(
            (response) => {
              console.log('loadStatus unconfirmedAdded' , response)
              resolve(response)
            },
            (error) => console.error('loadStatus unconfirmedAdded', error),
          )
        this.listener.confirmed(address)
          .pipe(
            filter((item) => (item.transactionInfo !== undefined && item.transactionInfo.hash === hash)),
            map((item) => new TransactionResult('SUCCESS', item.transactionInfo!.hash!, TransactionConfirmType.Confirm)),
          )
          .subscribe(
            (response) => {
              console.log('loadStatus confirmed', response)
              resolve(response)
            },
            (error) => console.error('loadStatus confirmed', error),
          )
      })
    })
  }
}

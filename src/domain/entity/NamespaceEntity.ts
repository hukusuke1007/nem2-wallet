export class NamespaceEntity {
  namespace: string
  namespaceId: string
  ownerAddress: string
  ownerPublicKey: string
  constructor(namespace: string, namespaceId: string, ownerAddress: string, ownerPublicKey: string) {
    this.namespace = namespace
    this.namespaceId = namespaceId
    this.ownerAddress = ownerAddress
    this.ownerPublicKey = ownerPublicKey
  }
}

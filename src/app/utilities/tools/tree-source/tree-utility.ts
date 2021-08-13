import { isArray } from '../../functions/mcs-array.function';
import { isNullOrEmpty } from '../../functions/mcs-object.function';
import { TreeGroup } from './tree-group';
import { TreeItem } from './tree-item';

type Dict<T> = { [key in keyof T]?: any };
type Single<T> = T extends Array<infer U> ? U : T;
type PickField<T, K extends keyof T> = T[K];
type Selector<TSource extends Dict<TSource> = any, TReturnType = any> = (source: TSource) => TReturnType;

export class TreeUtility {

  /**
   * Converts the entities to tree items equivalent, based on the
   * provided selector for child.
   * @param entities Entity items to be converted
   * @param mainProp The main group property to be served as the tree group
   * @param childProp1 Children property definition based on the provided children def in the mainProp.
   * However, when the children is provided. By Default, the treegroup def will be obtained based on the childProp1.
   * @param childProp2 When provided, the value of the children provided on childProp1
   * will be obtained based on provided treegroup definition.
   */
  public static convertEntityToTreemItems<
    TEntity,
    TMain extends Selector<TEntity, TreeGroup<Array<any>>>,
    TChild1 extends Selector<Single<PickField<ReturnType<TMain>, 'children'>>, TreeGroup<Array<any>>>,
    TChild2 extends Selector<Single<PickField<ReturnType<TChild1>, 'children'>>, TreeGroup<Array<any>>>
  >(
    entities: TEntity[],
    mainProp: TMain,
    childProp1: TChild1,
    childProp2?: TChild2
  ): TreeItem<any>[] {
    if (isNullOrEmpty(entities) || !isArray(entities)) { return []; }
    let mainTreeItems = new Array<TreeItem<any>>();

    let findAllChildrenFunc = (itemGroupInfo?: TreeGroup<any>) => {
      let mainChildRef = new TreeItem<any>();
      mainChildRef.text = itemGroupInfo.text;
      mainChildRef.value = itemGroupInfo.value;
      mainChildRef.option = itemGroupInfo.option;

      let childItems = itemGroupInfo.children;
      if (isNullOrEmpty(childItems)) { return mainChildRef; }

      childItems.forEach(child => {
        // Search deeply for grand children defined in childProp1 children, but
        // using the definition defined in childProp2
        let grandChildRef = findAllChildrenFunc(childProp2(child));
        let grandChildItems = childProp2(child).children;
        if (!isNullOrEmpty(grandChildItems)) {
          grandChildItems.forEach(subChild => {
            let subChildItems = findAllChildrenFunc(childProp2(subChild));
            grandChildRef.children.push(subChildItems);
          });
        }
        mainChildRef.children.push(grandChildRef);
      });
      return mainChildRef;
    };

    // Iterate and populate the records based on structure
    entities.forEach(entity => {
      let treeItem = new TreeItem<any>();
      treeItem.text = mainProp(entity).text;
      treeItem.value = mainProp(entity).value || entity;
      treeItem.option = mainProp(entity).option;

      mainTreeItems.push(treeItem);
      let treeChildren = mainProp(entity).children;
      if (isNullOrEmpty(treeChildren)) { return; }

      treeChildren.forEach(treeChild => {
        let childItem = findAllChildrenFunc(childProp1(treeChild));
        treeItem.children.push(childItem);
      });
    });
    return mainTreeItems;
  }
}
